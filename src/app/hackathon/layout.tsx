
export default function HackathonLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-black">
            {}
            <main className="flex-1">{children}</main>
        </div>
    );
}
