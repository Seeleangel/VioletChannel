import '../index.css';
import Navigation from '../components/Navigation';
import MusicPlayer from '../components/MusicPlayer';

export const metadata = {
    title: 'Violet Channel',
    description: 'Personal Blog & Portfolio',
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN">
            <body suppressHydrationWarning={true}>
                <Navigation />
                {children}
                <MusicPlayer />
            </body>
        </html>
    );
}
