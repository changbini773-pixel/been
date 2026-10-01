#!/usr/bin/env python3
"""index.html + css/js/data 파일을 '한 개의 HTML 파일'로 합칩니다.
사용법:  python3 build.py        → dist/EasyTrip.html 생성
(이 한 파일만 있으면 카톡/메일로 공유하거나 아티팩트로 올릴 수 있어요)"""
import re, os, sys
root = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
h = rd('index.html')
# CSS 인라인
h = re.sub(r'<link id="et-css" rel="stylesheet" href="([^"]+)">',
           lambda m: '<style id="et-css">' + rd(m.group(1)) + '</style>', h)
# 내 폴더의 스크립트만 인라인 (http로 시작하는 외부 스크립트는 그대로)
def inl(m):
    src = m.group(1)
    code = rd(src)
    if '</script' in code: sys.exit(src + ' 안에 </script 문자열이 있어 합칠 수 없어요')
    return '<script>\n' + code + '\n</script>'
h = re.sub(r'<script src="((?!https?:)[^"]+)"></script>', inl, h)
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
out = os.path.join(root, 'dist', 'EasyTrip.html')
open(out, 'w', encoding='utf-8').write(h)
print('완료:', out, round(len(h.encode()) / 1e6, 2), 'MB')
