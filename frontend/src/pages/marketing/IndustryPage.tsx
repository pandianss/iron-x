
import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout'; // Fix path if deeper
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const INDUSTRIES: Record<string, {
    title: string;
    description: string;
    points: string[];
    stat: string;
    statLabel: string;
    caseStudyId: string;
}> = {
    healthcare: {
        title: "Iron-X for Healthcare",
        description: "Eliminate 'Shift Drift' and ensure 100% HIPAA compliance with hard-enforced handover protocols.",
        points: [
            "Mandatory Shift Verification Protocols",
            "Role-Based Nurse/Doctor Access Control",
            "Automatic Audit Logging for Handover Events"
        ],
        stat: "14%",
        statLabel: "Reduction in Staff Burnout",
        caseStudyId: "HEALTHCARE_CASE_STUDY"
    },
    finance: {
        title: "Iron-X for Finance",
        description: "Enforce trading discipline and risk management protocols before the terminal even unlocks.",
        points: [
            "Pre-Trade Risk Acknowledgement Gates",
            "SSO-Linked Identity Verification",
            "Discipline Score Weighted Bonuses"
        ],
        stat: "0",
        statLabel: "Risk Breaches in Q4",
        caseStudyId: "FINANCE_CASE_STUDY"
    },
    manufacturing: {
        title: "Iron-X for Manufacturing",
        description: "Standardize shift changeovers and machine calibration with visual, enforced SOPs.",
        points: [
            "Calibration Check Interlocks",
            "Visual Standard Operating Procedures",
            "Real-Time Velocity Tracking"
        ],
        stat: "18m",
        statLabel: "Saved Per Shift Changeover",
        caseStudyId: "MANUFACTURING_CASE_STUDY"
    }
};

const IndustryPage = () => {
    const { industry } = useParams<{ industry: string }>();
    const data = INDUSTRIES[industry?.toLowerCase() || ''];

    if (!data) {
        return <Navigate to="/" replace />;
    }

    return (
        <MarketingLayout>
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h1 className="text-5xl font-bold mb-6">{data.title}</h1>
                    <p className="text-xl text-neutral-400 mb-8 leading-relaxed">
                        {data.description}
                    </p>
                    <ul className="space-y-4 mb-10">
                        {data.points.map((point, i) => (
                            <li key={i} className="flex items-start">
                                <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                                <span className="text-lg text-neutral-200">{point}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-4">
                        <Link
                            to="/register"
                            className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-neutral-200 transition-colors"
                        >
                            Get Started
                        </Link>
                        <Link
                            to={`/docs/case_studies/${data.caseStudyId}`} // This assumes we have a doc viewer or just link to git for now. 
                            // Actually, let's link to ROI calculator for now as 'See Impact'
                            className="flex items-center text-white font-semibold hover:text-iron-400 transition-colors px-6 py-3"
                        >
                            <Link to="/roi-calculator">Calculate ROI <ArrowRight className="ml-2 w-4 h-4 inline" /></Link>
                        </Link>
                    </div>
                </div>

                <div className="bg-neutral-900 rounded-3xl p-12 border border-neutral-800 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-iron-900/30 to-transparent" />
                    <div className="relative z-10">
                        <div className="text-8xl font-bold text-white mb-2">{data.stat}</div>
                        <div className="text-xl text-iron-400 uppercase tracking-widest">{data.statLabel}</div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default IndustryPage;
