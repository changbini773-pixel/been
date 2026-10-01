"""앱 스모크 테스트: app/index.html 을 열어 지역 4곳 전환 후 오류 없는지 확인.
python3 tests/compare_render.py  (playwright 필요)"""
import asyncio, os, json
from playwright.async_api import async_playwright
APP=os.path.abspath(os.path.join(os.path.dirname(__file__),'../app/index.html'))
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        p=await b.new_page(viewport={'width':430,'height':900}); errs=[]
        p.on('pageerror',lambda e:errs.append(str(e)))
        await p.goto('file://'+APP); await p.wait_for_timeout(2500)
        print('regions:',await p.evaluate("Object.keys(REGIONS).length"))
        for reg in ['gyeongsan','gyeongju','seoul_n','bs_haeundae']:
            await p.evaluate(f"setRegion('{reg}')"); await p.wait_for_timeout(500)
            await p.evaluate("goTab(1)"); await p.wait_for_timeout(300)
            print(reg,'spots',await p.evaluate("(REGIONS[S.region].spots||[]).length"))
        print('errors:',errs or 'none'); await b.close()
asyncio.run(main())
