import csv, json, math, os
rows=list(csv.DictReader(open(os.path.join(os.path.dirname(__file__),'../data/gyeongsan/경산_장소별_접근성_AI추출_v1.csv'),encoding='utf-8-sig')))
# Kakao coords (from collector session) + OSM
C={"까사평사":(35.89273,128.86246,"진량읍 내리평사로 105"),"섬섬밀밀":(35.89091,128.8563,"진량읍 대구대로 346"),
"동천면옥":(35.8191,128.75548,"계양로16길 70-1"),"경산역":(35.81933,128.72761,"중앙로 (OSM)"),
"영남대 자야":(35.83772,128.75322,"청운로 23-1"),"히어로보드게임카페 영남대점":(35.83762,128.75386,"대학로59길 5"),
"카페엔라포토":(35.81864,128.72626,"선비길2길 44"),"팔공산엄마밥상 경산점":(35.82464,128.72899,"성암로 108"),
"쭈나라꾸미":(35.81743,128.7231,"삼성현로35길 4"),"손시스시 영남대본점":(35.83924,128.75656,"대학로 325"),
"비발디":(35.90087,128.82391,"진량읍 대학로 1367"),"핸즈커피 하양점":(35.91831,128.83098,"하양읍 하양로 232"),
"꽃돼지식당 경산점":(35.82456,128.7285,"성암로 102"),"커피키친한일 하양본점":(35.91806,128.81924,"하양읍 금송로 62"),
"라라코스트 하양점":(35.9107,128.81585,"하양읍 하양로 64"),"그랜드대디":(35.83429,128.77141,"압량읍 감못둑길 63-4")}
VB={"가능":("ok","휠체어 가능"),"부분":("warn","휠체어 부분 가능"),"불가":("no","휠체어 불가"),"미확인":("n","휠체어 미확인")}
EVT={"방문":"방문 후기","방문+표기":"방문 후기 + 업체 표기","표기":"업체 표기만"}
def tagsOf(r):
    t=[]
    t.append("food" if r['분류'] in ("식당","카페","주점") else ("place" if r['분류'] in ("관광","공원","문화","교통","교육") else "etc"))
    if r['장애인화장실']=="있음": t.append("toilet")
    if "방문" in r['근거유형']: t.append("visit")
    if r['휠체어_판정']=="불가": t.append("no")
    if "단차 없음" in r['근거요약']: t.append("step0")
    return t
order={"방문":0,"방문+표기":0,"표기":1}
rows.sort(key=lambda r:(order[r['근거유형']], -int(r['언급글수'])))
spots=[];geo={}
for i,r in enumerate(rows):
    sid="y%d"%(i+1); v=r['휠체어_판정']
    b=[]
    b.append(["info" if "방문" in r['근거유형'] else "n", EVT[r['근거유형']]])
    for k,lab in (("엘리베이터","엘리베이터"),("장애인화장실","장애인 화장실"),("장애인주차","장애인 주차")):
        if r[k]=="있음": b.append(["ok",lab])
        elif r[k]=="없음": b.append(["no",lab+" 없음"])
    if r['유모차']=="가능": b.append(["ok","유모차 가능"])
    elif r['유모차']=="어려움": b.append(["warn","유모차 어려움"])
    if r['주의사항']: b.append(["warn",r['주의사항']])
    if r['OSM등록']: b.append(["info","OSM 등록 일치"])
    st={"가능":"ok","부분":"warn","불가":"no","미확인":"n"}[v]
    good=(v=="가능" and "방문" in r['근거유형'])
    f=[["휠체어",v+" · "+EVT[r['근거유형']],"ok" if good else "warn"],["근거",r['근거요약'],"ok" if v=="가능" else "warn"]]
    if r['주의사항']: f.append(["주의",r['주의사항'],"warn"])
    c=C.get(r['장소'])
    loc=r['지역']+(" · "+c[2] if c else "")
    s={"id":sid,"name":r['장소'],"cat":r['분류'],"dist":loc,"rate":None,"v":v,"cnt":int(r['언급글수']),
       "tags":tagsOf(r),"f":f,"badges":b,"rv":[],
       "evi":{"ty":EVT[r['근거유형']],"t":r['근거요약'],"w":r['주의사항'],"n":int(r['언급글수']),"u":r['대표출처'],"osm":bool(r['OSM등록'])}}
    spots.append(s)
    if c: geo[sid]=[c[0],c[1],None]
byname={s['name']:s for s in spots}
def stop(name,t,leg=None,note=None):
    s=byname[name]; d={"n":name,"k":s['cat'],"t":t,"s":s['v'],"f":s['f']}
    if leg: d["leg"]=leg
    if note: d["note"]=note
    return d
def dist(a,b):
    A=C[a];B=C[b]; dy=(A[0]-B[0])*111.0; dx=(A[1]-B[1])*111.0*math.cos(math.radians(35.8)); return math.hypot(dx,dy)
def leg(a,b): return "직선 %.1fkm · 소요시간 미산출"%dist(a,b)
days=[
 {"sub":"경산역·시내","stops":[
   stop("경산역","10:00",leg("경산역","팔공산엄마밥상 경산점"),"방문 후기(리모델링 후 엘리베이터)와 OSM wheelchair=yes가 일치한 유일한 교통 거점이야."),
   stop("팔공산엄마밥상 경산점","12:00",leg("팔공산엄마밥상 경산점","그랜드대디"),"업체 표기만 있고 방문 확인은 없어. 전화로 한 번 확인하는 걸 권해."),
   stop("그랜드대디","14:30",None,"화장실·출입구·좌석 휠체어 가능이 업체 표기로만 확인돼.")]},
 {"sub":"하양·진량","stops":[
   stop("라라코스트 하양점","12:00",leg("라라코스트 하양점","커피키친한일 하양본점"),"2층 매장이야. 승강기 여부는 수집 자료에 없어."),
   stop("커피키친한일 하양본점","14:00",leg("커피키친한일 하양본점","까사평사")),
   stop("까사평사","15:30",None,"방문 후기에 진입로 언덕이 가파르다는 서술이 있어. 수동휠체어는 동행 권장.")]}
]
region={"name":"경산","sub":"경상북도","ready":1,"real":1,
 "taxi":{"n":"경산시 이동지원센터 (특별교통수단)","tel":"053-802-1700","note":"경북 광역이동지원센터 1899-7770 · 사전 등록 필요","wait":""},
 "days":days,
 "toilets":[
  {"n":"하양 인근 공중화장실 (OSM)","dist":"하양읍 인근","st":"확인 필요","ok":1,"d":"OSM에 wheelchair=yes · 남녀공용으로 등록"},
  {"n":"경산역","dist":"중앙동","st":"확인 필요","ok":0,"d":"역 엘리베이터는 확인됨 · 장애인 화장실 정보는 수집 자료에 없음"}],
 "toiletNote":"공중화장실 표준데이터(공공데이터포털) 연동 전이라 수집된 2곳만 표시해.",
 "discounts":[
  {"n":"KTX·일반열차 (코레일)","v":"30~50%","d":"심한 장애 50% · 심하지 않은 장애 30%(주중만)"},
  {"n":"경산 교통약자·임산부 바우처 택시","v":"1,100원~","d":"5km까지 1,100원 · 비휠체어 중증 보행장애인·임산부 대상 · 2026.3 시행"}],
 "discNote":"경산 관광지별 장애인 할인은 아직 수집 전이야. 위 2건만 공식 발표로 확인됐어.",
 "spots":spots,
 "dataNote":{"src":"카카오 장소 765곳 · 블로그 1,843건 · OSM 18건 (2026.09.30 수집)",
   "rows":[["숙박","0","64"],["병원","1","147"],["음식점","19","264"],["카페","15","236"],["관광명소","2","29"],["문화시설","1","25"]],
   "hit":38,"total":765,"places":len(spots),
   "verd":{k:sum(1 for s in spots if s['v']==k) for k in ("가능","부분","불가","미확인")}}}
js="gyeongsan:"+json.dumps(region,ensure_ascii=False)+",\n"
open('gs_region.js','w').write(js)
open('gs_geo.json','w').write(json.dumps(geo,ensure_ascii=False))
print(len(spots),region['dataNote']['verd'],len(geo),[ (s['name'],s['tags']) for s in spots[:5]])
