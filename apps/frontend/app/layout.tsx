import './globals.css';

export const metadata = { title: 'Forgeway | From spark to shipped', description: 'Turn one sentence into a launch-ready startup.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
