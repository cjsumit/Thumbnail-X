import { footerData } from "../data/footer";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";
import { motion } from "motion/react";
import type { IFooterLink } from "../types";
import { Link } from "react-router-dom";

interface ITeamMember {
    name: string;
    github: string;   // github username -> used for avatar + profile link
    linkedin: string; // linkedin slug (after linkedin.com/in/)
    twitter: string;  // twitter/x handle
}

const members: ITeamMember[] = [
    {
        name: "Shubham Bind",
        github: "Shubham123-k",
        linkedin: "shubham-bind-53305432b",
        twitter: "shubhamkbind69",
    },
    {
        name: "Sumit Vishwakarma",
        github: "cjsumit",
        linkedin: "sumit-vishwakarma272",
        twitter: "REPLACE_WITH_TWITTER_HANDLE",
    },
];

export default function Footer() {
    return (
        <footer className="flex flex-wrap justify-center md:justify-between overflow-hidden gap-10 md:gap-20 mt-40 py-6 px-6 md:px-16 lg:px-24 xl:px-32 text-[13px] text-gray-500">
            <motion.div className="flex flex-wrap items-start gap-10 md:gap-35"
                initial={{ x: -150, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
            >
                <Link to="/">
                    <img className="size-8 aspect-square" src="/favicon.svg" alt="footer logo" width={32} height={32} />
                </Link>
                {footerData.map((section, index) => (
                    <div key={index}>
                        <p className="text-slate-100 font-semibold">{section.title}</p>
                        <ul className="mt-2 space-y-2">
                            {section.links.map((link: IFooterLink, index: number) => (
                                <li key={index}>
                                    <Link to={link.href} className="hover:text-pink-600 transition">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </motion.div>

            <motion.div className="flex flex-col max-md:items-center max-md:text-center gap-2 items-end"
                initial={{ x: 150, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
            >
                <p className="max-w-60">Making every customer feel valued—no matter the size of your audience.</p>

                <div className="flex flex-col gap-4 mt-3 max-md:items-center">
                    {members.map((member) => (
                        <div key={member.github} className="flex items-center gap-3">
                            <img
                                src={`https://github.com/${member.github}.png`}
                                alt={member.name}
                                width={32}
                                height={32}
                                className="size-8 rounded-full object-cover border border-gray-700"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/favicon.svg";
                                }}
                            />
                            <div className="flex flex-col">
                                <a
                                    href={`https://github.com/${member.github}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-100 font-medium hover:text-pink-500"
                                >
                                    {member.name}
                                </a>
                                <div className="flex items-center gap-3 mt-1">
                                    <a href={`https://github.com/${member.github}`} target="_blank" rel="noreferrer">
                                        <GithubIcon className="size-4 hover:text-pink-500" />
                                    </a>
                                    <a href={`https://www.linkedin.com/in/${member.linkedin}`} target="_blank" rel="noreferrer">
                                        <LinkedinIcon className="size-4 hover:text-pink-500" />
                                    </a>
                                    <a href={`https://x.com/${member.twitter}`} target="_blank" rel="noreferrer">
                                        <TwitterIcon className="size-4 hover:text-pink-500" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-3 text-center">&copy; {new Date().getFullYear()} <Link to="/" className="hover:text-pink-500">Thumbnail X</Link></p>
            </motion.div>
        </footer>
    );
}