import Link from "next/link";
import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#FAFAF9]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-full lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C1917]">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-[#1C1917]">
                Flint
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
              작은 불꽃이 시장을 밝힙니다.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              서비스
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/reports" className="text-sm text-[#6B7280] hover:text-[#1C1917]">
                  리포트 둘러보기
                </Link>
              </li>
              <li>
                <Link href="/write" className="text-sm text-[#6B7280] hover:text-[#1C1917]">
                  애널리스트 참여
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              회사
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-[#6B7280] hover:text-[#1C1917]">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[#6B7280] hover:text-[#1C1917]">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              고객센터
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-[#6B7280]">
                  hello@flint.kr
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#E5E7EB] pt-6">
          <p className="text-xs leading-relaxed text-[#6B7280]">
            본 플랫폼에 게시된 리포트는 투자 권유가 아니며, 투자 판단의 최종
            책임은 투자자 본인에게 있습니다. 리포트 작성자의 의견은 작성
            시점의 판단이며, 이후 변경될 수 있습니다.
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">
            &copy; {new Date().getFullYear()} Flint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
