import json,math,re
from collections import Counter,defaultdict
R=json.load(open('results_all.json'));SIG={p['id']:p for p in json.load(open('signal_702.json'))};ST=json.load(open('stats.json'))
def norm(s): return re.sub(r'[\s.,!?~·…\'"“”‘’()|]','',s or '')
BUSAN=[('bs_nampo','남포·원도심','Nampo',['중구']),('bs_songdo','송도·영도','Songdo · Yeongdo',['서구','영도구']),
 ('bs_seomyeon','서면·부산역','Seomyeon',['부산진구','동구']),('bs_gwangan','광안리·대연','Gwangalli',['수영구','남구']),
 ('bs_haeundae','해운대·기장','Haeundae · Gijang',['해운대구','기장군']),('bs_dongnae','동래·연제·금정','Dongnae',['동래구','연제구','금정구']),
 ('bs_west','서부산','West Busan',['사하구','사상구','북구','강서구'])]
REG={'gyeongju':('경주','경상북도','Gyeongju','gyeongju',lambda p:p['city']=='경주'),
 'jeonju':('전주','전북특별자치도','Jeonju','jeonju',lambda p:p['city']=='전주'),
 'gangneung':('강릉','강원특별자치도','Gangneung','gangneung',lambda p:p['city']=='강릉'),
 'seoul_n':('서울 강북','서울특별시','Seoul Gangbuk','seoul',lambda p:p['city']=='서울 강북'),
 'seoul_s':('서울 강남','서울특별시','Seoul Gangnam','seoul',lambda p:p['city']=='서울 강남')}
for k,n,en,gus in BUSAN: REG[k]=('부산 '+n,'부산광역시',en,'busan',(lambda gus: lambda p:p['city']=='부산' and p['unit'] in gus)(gus))
EV={'방문':'방문 후기','방문+표기':'방문 후기 + 업체 표기','표기':'업체 표기만','공식안내':'공식 안내 인용',None:'후기'}
GRP=['음식점','카페','관광명소','숙박','문화시설','병원']
PH={'보문':('보문호','주변 대표 사진'),'황리단길':('황리단길','주변 대표 사진'),'불국사':('불국사','주변 대표 사진'),'한옥마을':('전주 한옥마을','주변 대표 사진'),'경포':('경포호','주변 대표 사진'),'안목':('안목해변','주변 대표 사진')}
out={};geo={};summary={}
for key,(name,sub,en,theme,f) in REG.items():
    ps=[SIG[i] for i in R if f(SIG[i])]
    good=[]
    for p in ps:
        x=R[p['id']]
        if x['verdict']=='미확인' or not x.get('quote'): continue
        src=' '.join(d['t'] for d in p['docs'])
        if norm(x['quote']) not in norm(src): continue
        good.append((p,x))
    order={'방문':0,'방문+표기':0,'공식안내':1,'표기':2,None:3}
    good.sort(key=lambda t:(order.get(t[1]['source'],3),-t[0]['n']))
    spots=[]
    for i,(p,x) in enumerate(good):
        v=x['verdict'];sid='%s_%d'%(key,i+1);src=x['source']
        b=[["info" if src and '방문' in src else "n",EV.get(src,'후기')]]
        for fk,lab in (('elevator','엘리베이터'),('toilet','장애인 화장실'),('parking','장애인 주차')):
            if x.get(fk)=='있음': b.append(['ok',lab])
            elif x.get(fk)=='없음': b.append(['no',lab+' 없음'])
        if x.get('stroller')=='가능': b.append(['ok','유모차 가능'])
        elif x.get('stroller')=='어려움': b.append(['warn','유모차 어려움'])
        if x.get('caution'): b.append(['warn',x['caution'][:40]])
        if x.get('ad'): b.append(['n','홍보성 글 포함'])
        good_v=(v=='가능' and src and '방문' in src)
        fct=[["휠체어",v+' · '+EV.get(src,'후기'),'ok' if good_v else 'warn'],["근거",x['summary'],'ok' if v=='가능' else 'warn']]
        if x.get('caution'): fct.append(['주의',x['caution'],'warn'])
        grp=p['group']
        tags=['food' if grp in ('음식점','카페') else 'stay' if grp=='숙박' else 'place' if grp in ('관광명소','문화시설') else 'etc']
        if x.get('toilet')=='있음': tags.append('toilet')
        if src and '방문' in src: tags.append('visit')
        if v=='불가': tags.append('no')
        addr=re.sub(r'^(서울|부산|경북|전북특별자치도|전북|강원특별자치도|강원)\s*','',p['addr'] or '')
        ph=PH.get(p['unit'])
        s={'id':sid,'name':p['name'],'cat':grp if grp!='음식점' else '식당','dist':p['unit']+' · '+addr,'rate':None,'v':v,'cnt':p['n'],'tags':tags,'f':fct,'badges':b,'rv':[],
           'evi':{'ty':EV.get(src,'후기'),'t':x['summary'],'w':x.get('caution') or '','n':p['n'],'u':x.get('doc') or p['docs'][0]['u'],'osm':False}}
        if ph: s['ph']=list(ph)
        spots.append(s);geo[sid]=[round(p['y'],6),round(p['x'],6)]
    # stats per category for this region
    ug=ST['ug'];rows=[];tot=0
    judged_by=Counter(p['group'] for p,x in good)
    units=set(p['unit'] for p in [SIG[i] for i in R] if f(p))|set(k.split('|')[1] for k in ug if f({'city':k.split('|')[0],'unit':k.split('|')[1]}))
    for gname in GRP:
        t=sum(v for k,v in ug.items() if k.split('|')[2]==gname and f({'city':k.split('|')[0],'unit':k.split('|')[1]}))
        tot+=t;rows.append([gname,str(judged_by.get(gname,0)),str(t)])
    vc=Counter(s['v'] for s in spots)
    no_src=Counter(x['source'] for p,x in good if x['verdict']=='불가')
    # toilets from data
    toilets=[{'n':s['name'],'dist':s['dist'].split(' · ')[0],'st':'후기 확인','ok':1,'d':s['evi']['t'][:40]} for s in spots if 'toilet' in s['tags']][:8]
    # route: 2 days from visit+가능
    cand=[s for s in spots if s['v']=='가능' and 'visit' in s['tags']]
    if len(cand)<4: cand+= [s for s in spots if s['v']=='가능' and s not in cand]
    cand=cand[:10]
    days=[]
    if len(cand)>=2:
        pts=[(s,geo[s['id']]) for s in cand]
        pts.sort(key=lambda t:t[1][1])
        halves=[pts[:len(pts)//2],pts[len(pts)//2:]] if len(pts)>=4 else [pts]
        for h in halves:
            h=h[:3];stops=[]
            for j,(s,g) in enumerate(h):
                st={'n':s['name'],'k':s['cat'],'t':['10:00','12:30','15:00'][j],'s':s['v'],'f':s['f']}
                if j<len(h)-1:
                    g2=h[j+1][1];d=math.hypot((g[0]-g2[0])*111,(g[1]-g2[1])*111*math.cos(math.radians(g[0])));st['leg']='직선 %.1fkm · 소요시간 미산출'%d
                if s['evi']['w']: st['note']=s['evi']['w']
                stops.append(st)
            units_h=Counter(s['dist'].split(' · ')[0] for s,g in h).most_common(1)[0][0]
            days.append({'sub':units_h,'stops':stops})
    out[key]={'name':name,'sub':sub,'en':en,'theme':theme,'ready':1,'real':1,
      'taxi':{'n':'서울 장애인콜택시 (서울시설공단)','tel':'1588-4388','note':'24시간 · 21시 이후 2시간 전 예약 권장','wait':''} if theme=='seoul' else {'n':name.split(' ')[0]+' 교통약자 이동지원센터','tel':'번호 확인 중','note':'지자체 운영 · 사전 등록 필요','wait':''},
      'days':days,'toilets':toilets,'toiletNote':'장애인 화장실이 있다고 후기에서 확인된 장소야. 공중화장실 표준데이터 연동 전.',
      'discounts':[{'n':'KTX·일반열차 (코레일)','v':'30~50%','d':'심한 장애 50% · 심하지 않은 장애 30%(주중만)'}]+([{'n':'서울 장애인콜택시','v':'1,500원~','d':'5km까지 기본요금 1,500원'}] if theme=='seoul' else []),
      'discNote':'관광지별 장애인 할인은 아직 수집 전이야. 공식 발표로 확인된 것만 넣었어.',
      'spots':spots,
      'dataNote':{'src':'카카오 장소 %s곳 · 블로그 %s건 (2026.09.30 수집)'%('{:,}'.format(tot),'{:,}'.format(sum(v for k,v in ST['a']['bu'].items() if f({'city':k.split('|')[0],'unit':k.split('|')[1]})))),
        'rows':rows,'hit':len(spots),'total':tot,'places':len(spots),'verd':{k:vc.get(k,0) for k in ('가능','부분','불가','미확인')},
        'noVisit':sum(v for k,v in no_src.items() if k and '방문' in k),'noAll':sum(no_src.values())}}
    summary[key]=(name,len(spots),tot,dict(vc),len(days))
json.dump({'regions':out,'geo':geo},open('newreg.json','w'),ensure_ascii=False)
for k,v in summary.items(): print(k,v)
