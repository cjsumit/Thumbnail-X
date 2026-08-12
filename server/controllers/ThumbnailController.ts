import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import ai from '../configs/ai.js';

const stylePrompts = {
    'Bold & Graphic': 'high-impact YouTube thumbnail, dramatic composition, expressive focal subject, strong visual hierarchy, professional graphic design, 8k resolution',
    'Tech/Futuristic': 'futuristic YouTube thumbnail, sleek modern aesthetic, glowing neon accents, holographic UI elements, cyber-tech background, sharp studio lighting',
    'Minimalist': 'minimalist YouTube thumbnail, ultra-clean aesthetic, high contrast, bold central focal point, elegant geometry, sleek modern design',
    'Photorealistic': 'photorealistic YouTube thumbnail, cinematic lighting, shallow depth of field, 8k DSLR photography, natural skin tones, dramatic shadows',
    'Illustrated': 'custom digital vector illustration thumbnail, vibrant cartoon art style, bold outlines, energetic character design, creative artwork',
};

const colorSchemeDescriptions = {
    vibrant: 'electric vibrant colors, neon pinks, bright yellows, high-saturation contrast',
    sunset: 'cinematic sunset color palette with rich oranges, deep purples, and golden hour lighting',
    forest: 'rich emerald greens, deep earthy browns, vibrant organic foliage accents',
    neon: 'cyberpunk neon lighting, glowing cyan and magenta highlights, dark contrast background',
    purple: 'deep violet and magenta color scheme, glowing purple atmospheric light',
    monochrome: 'dramatic high-contrast black and white, deep shadows, crisp white highlights',
    ocean: 'aquatic cyan, deep navy, and bright teal color palette, fresh luminous lighting',
    pastel: 'soft aesthetic pastel hues, gentle saturation, modern clean color grading',
};

const aspectRatioToDims: Record<string, { width: number; height: number }> = {
    '16:9': { width: 1344, height: 768 },
    '1:1': { width: 1024, height: 1024 },
    '9:16': { width: 768, height: 1344 },
    '4:3': { width: 1152, height: 896 },
};

export const generateThumbnail = async (req: Request, res: Response) => {
    let thumbnail;
    try {
        const { userId } = req.session;
        const {
            title,
            prompt: user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay
        } = req.body;

        thumbnail = await Thumbnail.create({
            userId,
            title,
            prompt_used: user_prompt,
            user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true
        });

        // 1. Base style definition
        const styleText = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts['Bold & Graphic'];
        
        // 2. Build structured prompt components
        let promptComponents: string[] = [];

        promptComponents.push(`Professional YouTube thumbnail, ${styleText}.`);
        promptComponents.push(`Central subject & scene topic: "${title}".`);

        // 3. Enforce text overlay if enabled
        if (text_overlay) {
            promptComponents.push(
                `Featuring bold, large, high-contrast 3D typography text overlay reading exact text: "${title.toUpperCase()}". The text must be legible, clean, correctly spelled, and positioned prominently.`
            );
        }

        // 4. Enforce color scheme
        if (color_scheme && colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]) {
            const colorText = colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions];
            promptComponents.push(
                `Dominant color theme: ${colorText}. Apply these colors to background rim lighting, text outlines, and key accents.`
            );
        }

        // 5. Append additional details from user
        if (user_prompt) {
            promptComponents.push(`Additional creative details: ${user_prompt}.`);
        }

        // 6. Quality & Composition Boosters
        promptComponents.push(
            `Designed specifically for high click-through rate (CTR), eye-catching visual composition, ultra-sharp detail, professional studio quality.`
        );

        // Final merged prompt string
        const finalPrompt = promptComponents.join(' ');

        const dims = aspectRatioToDims[aspect_ratio] || aspectRatioToDims['16:9'];

        // Generate the image using FLUX.1-dev
        const imageBlob = await ai.textToImage(
    {
        model: 'black-forest-labs/FLUX.1-schnell',
        inputs: finalPrompt,
    },
    { outputType: 'blob' }
);

        if (!imageBlob) {
            throw new Error('No image returned from FLUX.1-dev');
        }

        const finalBuffer = Buffer.from(await imageBlob.arrayBuffer());

        const filename = `final-output-${Date.now()}.png`;
        const filePath = path.join('images', filename);

        // Create the images directory if it doesn't exist
        fs.mkdirSync('images', { recursive: true });

        // Write the final image to disk
        fs.writeFileSync(filePath, finalBuffer);

        // Upload to Cloudinary (Enforce HTTPS URLs to prevent mixed content warnings)
        const uploadResult = await cloudinary.uploader.upload(filePath, { 
            resource_type: 'image',
            secure: true 
        });

        // Use secure_url to avoid browser mixed-content/HTTPS warnings
        thumbnail.image_url = uploadResult.secure_url || uploadResult.url.replace('http://', 'https://');
        thumbnail.isGenerating = false;
        await thumbnail.save();

        res.json({ message: 'Thumbnail Generated', thumbnail });

        // Remove image file from disk
        fs.unlinkSync(filePath);

    } catch (error: any) {
        console.log(error);

        if (thumbnail) {
            thumbnail.isGenerating = false;
            await thumbnail.save().catch(() => {});
        }

        res.status(500).json({ message: error.message });
    }
};

// Deletion Controller
export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.session;

        const deleted = await Thumbnail.findOneAndDelete({ _id: id, userId });

        if (!deleted) {
            return res.status(404).json({ message: 'Thumbnail not found' });
        }

        res.json({ message: 'Thumbnail deleted successfully' });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};