import "./globals.css";
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import { Providers } from '@/components/Providers'

export const metadata = {
  title: "CoUp - 함께, 더 높이",
  description: "당신의 성장을 위한 스터디 허브",
  keywords: "스터디, 스터디 그룹, 온라인 스터디, 학습, 성장",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
