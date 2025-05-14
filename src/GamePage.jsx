// GamePage.jsx
import { useState, useEffect, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import './GamePage.css';
import StatusPanel from './StatusPanel';
import * as XLSX from 'xlsx';

const cardTypeStyles = {
    시민: { color: '#4CAF50', icon: '👨‍👩‍👧‍👦', lightColor: '#E8F5E9' }, // 연한 연두 
    기업: { color: '#2196F3', icon: '🏢', lightColor: '#E3F2FD' }, // 연한 파랑
    국가: { color: '#673AB7', icon: '🏛️', lightColor: '#EDE7F6' }, // 연한 보라
    연구: { color: '#FF9800', icon: '🔬', lightColor: '#FFF3E0' }, // 연한 주황
    재난: { color: '#f44336', icon: '🌪️', lightColor: '#FFEBEE' } // 연한 빨강
};

function GamePage() {
    const [allCards, setAllCards] = useState([]); // 전체 카드
    const [currentCard, setCurrentCard] = useState(null); // 현재 보여지는 카드
    // const [usedCardNumbers, setUsedCardNumbers] = useState([]); // 랜덤 추출된 카드들 
    // const [noCards, setNoCards] = useState([]); // NO 카드들만 따로 저장
    const [yesCards, setYesCards] = useState([]);            // YES로 채택된 카드들
    const [currentIndex, setCurrentIndex] = useState(0); // ✅ YES 선택된 카드 수를 추적

    const [scenarios, setScenarios] = useState([]); // 시나리오 데이터

    // 상태창 데이터 세팅
    const [carbon, setCarbon] = useState(100);     // 탄소량: 0 ~ 100
    const [happiness, setHappiness] = useState(10); // 행복도: 0 ~ 10
    const [budget, setBudget] = useState(10);       // 예산: 0 ~ 10

    // 변화량 상태 추가
    const [delta, setDelta] = useState({ carbon: 0, happiness: 0, budget: 0 });

    // 프롤로그 화면
    const [showIntro, setShowIntro] = useState(true);

    // 전환 효과
    const [fadeOut, setFadeOut] = useState(false);
    const [gameFadeIn, setGameFadeIn] = useState(false);

    // 엔딩 화면
    const [showEnding, setShowEnding] = useState(false);     // ✅ 엔딩 화면 표시 여부
    const [endingType, setEndingType] = useState(null);       // ✅ 엔딩 번호 (2~6 중 하나)

    // 연구 카드 추가 효과 팝업
    const [showResearchPopup, setShowResearchPopup] = useState(false);

    // 카드 스와이프 체크
    const [isSwiping, setIsSwiping] = useState(false);

    // 연구완성 카드 개별 저장
    const [researchCompleteCard, setResearchCompleteCard] = useState(null);

    const researchYesCountForUI = yesCards.filter((c) => c.type === '연구');

    // 엔딩 번호에 해당하는 시나리오 찾기
    const endingScenario = scenarios.find(
        (s) => String(s.data?.['번호']) === String(endingType)
    );
    const endingImage = endingScenario?.image;
    const endingText = endingScenario?.data?.['텍스트'] || '결과 텍스트 없음';

    // pickNextCard 중복 호출 방지용 플래그
    const pickCardCalled = useRef(false);

    useEffect(() => {
        const uploaded = JSON.parse(localStorage.getItem('matchedCards')) || [];
        const scenarioData = JSON.parse(localStorage.getItem('matchedScenarios')) || [];
        console.log('[🧩 게임 페이지 업로드 카드]', uploaded);
        console.log('[🧩 게임 페이지 시나리오]', scenarioData);

        setScenarios(scenarioData);

        // ✅ body 배경 이미지 동적 설정
        if (scenarioData.length > 0) {
            document.body.style.backgroundImage = `url(${scenarioData[0].image})`;
            document.body.style.backgroundSize = '100% 100%';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';
        }

        // ✅ 진짜 카드 데이터만 꺼냄
        const validRows = uploaded.map((row) => row.data).filter((row) =>
            row['번호'] && row['제목'] && row['한줄 설명'] && row['효과'] && row['카드유형']
        );

        // ✅ 카드 데이터 가공
        const rawParsed = validRows.map((row) => ({
            cardNumber: String(row['번호']),
            title: row['제목'],
            description: row['한줄 설명'],
            effects: parseEffects(row['효과']),
            type: row['카드유형']?.trim(),
        }));

        // 연구완성 카드 따로 저장
        const researchCard = rawParsed.find(card => card.type === '연구 완성');
        const parsed = rawParsed.filter(card => card.type !== '연구 완성');
        console.log('[🃏 필터링 후 남은 카드]', parsed);

        setResearchCompleteCard(researchCard);
        setAllCards(parsed); // 전체 카드 저장

        console.log('[🎴 초기 카드 목록]', parsed);
        console.log('[📌 최초 카드]', parsed[Math.floor(Math.random() * parsed.length)]);

        // pickNextCard(parsed, []); // ✅ 연구완성 제외된 카드 중 랜덤 1장 뽑기
    }, []);

    // 카드 초기화 이후 pickNextCard 트리거
    useEffect(() => {
        if (
            allCards.length > 0 &&
            yesCards.length === 0 &&
            !currentCard &&
            !showIntro &&
            !showEnding &&
            !pickCardCalled.current
        ) {
            console.log('[✅ 카드 다시 뽑기 조건 충족]');
            console.log('🔍 카드 수:', allCards.length);
            console.log('🧩 currentCard:', currentCard);
            console.log('🎯 showIntro:', showIntro, '| showEnding:', showEnding);
            pickCardCalled.current = true;
            pickNextCard(allCards, []);
        }
    }, [allCards.length, yesCards.length, currentCard, showIntro, showEnding]);

    useEffect(() => {
        console.log('[🧊 currentCard 변화 감지]', currentCard);
        if (currentCard) setIsSwiping(false); // 카드 새로 뽑으면 자동 해제
    }, [currentCard]);

    // 연구 카드 추가 효과 팝업 테스트용
    // useEffect(() => {
    //     const handleKey = (e) => {
    //         if (e.key === 'r') {
    //             setShowResearchPopup(true);
    //             setTimeout(() => {
    //                 console.log('⏰ 팝업 끄기');
    //                 setShowResearchPopup(false);
    //             }, 5000);  // 확실히 시간 지정
    //         }
    //     };

    //     window.addEventListener('keydown', handleKey);
    //     return () => window.removeEventListener('keydown', handleKey);
    // }, [])

    useEffect(() => {
        console.log('[🔍 Popup State] showResearchPopup:', showResearchPopup);
    }, [showResearchPopup]);

    const parseEffects = (effectString) => {
        console.log('[parseEffects] effectString:', effectString);

        const result = {
            carbon: 0,
            budget: 0,
            happiness: 0
        };

        // ✅ effectString이 없거나 문자열이 아니면 그대로 0값 result 리턴
        if (typeof effectString !== 'string' || effectString.trim() === '') return result;

        const regexMap = {
            carbon: /탄소\s*([+-]?\d+(\.\d+)?)/,
            budget: /예산\s*([+-]?\d+(\.\d+)?)/,
            happiness: /행복도\s*([+-]?\d+(\.\d+)?)/,
        };

        for (const [key, regex] of Object.entries(regexMap)) {
            const match = effectString.match(regex);
            if (match) result[key] = parseFloat(match[1]);
        }

        return result;
    };

    const pickNextCard = (cards, yesSelected) => {
        console.log('[🌀 pickNextCard 호출됨]');
        console.log('전체 카드 수:', cards.length);
        console.log('YES 선택된 카드 수:', yesSelected.length);

        if (yesSelected.length >= 20) {
            console.warn('[⚠️ 중단] YES 카드 20장 도달');
            return;
        }

        // 카드번호 기준으로 YES 카드를 제외
        const yesCardNumbers = yesSelected.map(c => c.cardNumber);
        const candidates = cards.filter(c => !yesCardNumbers.includes(c.cardNumber));

        console.log('남은 후보 카드 수:', candidates.length);

        if (candidates.length === 0) {
            console.warn('[🚫 후보 없음] currentCard를 null로 설정');
            setCurrentCard(null);
        } else {
            const next = candidates[Math.floor(Math.random() * candidates.length)];
            console.log('[🎯 다음 카드 선택됨]', next);

            // ✅ currentCard를 null로 만든 다음, 다음 프레임에서 다시 설정
            setCurrentCard(null);

            // ✅ 다음 카드 설정 완료 후 다시 pick 가능하도록 해제
            setTimeout(() => {
                setCurrentCard(next);
                console.log('[✅ setCurrentCard 호출됨]', next);

                pickCardCalled.current = false;
                setIsSwiping(false);
            }, 100); // 살짝 딜레이를 줘야 정확
        }

        // pickNextCard 내부 로그
        console.log('[📍 pickNextCard]', {
            candidates,
            currentCard,
            pickCardCalled: pickCardCalled.current,
        });
    };

    // 엔딩 체크
    const endGameCheck = (carbon, budget, happiness) => {
        if (carbon <= 0) return 2; // 탄소중립 성공
        if (budget < 0 && happiness < 0) return 5;
        if (budget < 0) return 3;
        if (happiness < 0) return 4;
        return null; // 아직 엔딩 조건 미충족
    };

    const handleSwipe = (direction) => {
        if (isSwiping || !currentCard) return; // 🔒 스와이프 잠금 중이면 무시
        if (currentCard.type === '재난' && direction === 'left') return; // ✅ 재난카드는 NO를 무시

        setIsSwiping(true); // 🔒 무조건 잠금

        // ✅ 구조분해 미리
        const { carbon: dc = 0, happiness: dh = 0, budget: db = 0 } = currentCard.effects;

        // ✅ 연구 YES 카드 수 체크
        const nextYesCards = direction === 'right' ? [...yesCards, currentCard] : yesCards;
        const researchYesCount = nextYesCards.filter((c) => c.type === '연구').length;

        // ✅ 효과 적용
        let nextCarbon = carbon;
        let nextHappiness = happiness;
        let nextBudget = budget;

        // ✅ YES 선택시
        if (direction === 'right') {
            setYesCards(nextYesCards);

            // 항상 효과 적용
            nextCarbon += dc;
            nextHappiness += dh;
            nextBudget += db;

            setDelta({ carbon: dc, happiness: dh, budget: db });

            // ✅ 우선 세번째 연구카드 효과만 반영한 뒤, 엔딩 판별
            let ending = endGameCheck(nextCarbon, nextBudget, nextHappiness);

            // ✅ 연구카드 3번째일 경우 추가 효과(팝업) >> 조건 만족하면 연구완성 효과 추가
            if (currentCard.type === '연구' && researchYesCount === 3 && ending === null) {
                if (researchCompleteCard) {
                    // 추가 효과 반영
                    const { carbon: rc = 0, happiness: rh = 0, budget: rb = 0 } = researchCompleteCard.effects;
                    nextCarbon += rc;
                    nextHappiness += rh;
                    nextBudget += rb;

                    setShowResearchPopup(true);
                    setTimeout(() => setShowResearchPopup(false), 5000);

                    console.log('🎉 연구카드 효과 발동됨! (3번째 YES)');

                    // 추가 효과 반영 후 다시 엔딩 판별
                    ending = endGameCheck(nextCarbon, nextBudget, nextHappiness);
                } else {
                    console.warn('🚨 연구완성 카드가 등록되지 않았습니다!');
                }
            }

            // ✅ 최종 엔딩 판단
            if (ending !== null) {
                setCarbon(nextCarbon);
                setHappiness(nextHappiness);
                setBudget(nextBudget);
                setEndingType(ending);
                setShowEnding(true);
                return;
            }
        } else {
            // setNoCards(prev => [...prev, currentCard]);
            setDelta({ carbon: 0, happiness: 0, budget: 0 });
        }

        // ✅ 엔딩
        // const ending = endGameCheck(nextCarbon, nextBudget, nextHappiness);
        // if (ending !== null) {
        //     setCarbon(nextCarbon);
        //     setHappiness(nextHappiness);
        //     setBudget(nextBudget);
        //     setEndingType(ending);
        //     setShowEnding(true);
        //     return;
        // }

        // ✅ 상태값 업데이트
        setCarbon(nextCarbon);
        setHappiness(nextHappiness);
        setBudget(nextBudget);

        // ✅ 턴 증가 또는 카드 교체
        setTimeout(() => {
            setDelta({ carbon: 0, happiness: 0, budget: 0 });
            setIsSwiping(false); // 🔓 잠금 해제

            const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex;
            setCurrentIndex(nextIndex);

            // ✅ 20턴 도달 시 종합 평가
            if (nextIndex === 20) {
                let finalEnding = 2;
                if (nextCarbon > 0) finalEnding = 6;
                else if (nextBudget < 0 && nextHappiness >= 0) finalEnding = 3;
                else if (nextBudget >= 0 && nextHappiness < 0) finalEnding = 4;
                else if (nextBudget < 0 && nextHappiness < 0) finalEnding = 5;

                setEndingType(finalEnding);
                setShowEnding(true);
            } else {
                // ✅ 다음 카드 뽑기
                // const updatedUsed = direction === 'right' ? [...usedCardNumbers, currentCard.cardNumber] : usedCardNumbers;
                // setUsedCardNumbers(updatedUsed);
                // pickNextCard(allCards, updatedUsed);
                // const totalPool = [...allCards, ...noCards];
                // pickNextCard(totalPool);
                pickNextCard(allCards, nextYesCards);
            }
        }, 1200);
    };

    const handleStart = (skipIntro = false) => {
        // 🔄 상태 초기화
        setYesCards([]);
        setCurrentIndex(0);
        setCurrentCard(null);
        setDelta({ carbon: 0, happiness: 0, budget: 0 });
        setCarbon(100);
        setHappiness(10);
        setBudget(10);
        setShowResearchPopup(false);
        setEndingType(null);
        setShowEnding(false);

        // 💡 currentCard 초기화보다 pick 먼저
        pickCardCalled.current = true; // 방어적 설정

        if (!skipIntro) {
            // ✅ 인트로 보이기 → 페이드아웃 시작
            setFadeOut(true); // 먼저 페이드아웃 트리거
            setShowIntro(true);

            setTimeout(() => {
                setShowIntro(false); // 실제로 제거
                setGameFadeIn(true); // ✅ 게임 페이드인 시작

                // intro 닫힘 적용 이후 50ms 정도 뒤에 다시 카드 뽑기
                setTimeout(() => {
                    pickNextCard(allCards, []);
                }, 50);

                setCurrentCard(null); // 이후 null 처리
            }, 2000); // CSS transition 시간과 맞춰야 자연스러움
        } else {
            // ✅ 인트로 건너뛰기
            setShowIntro(false);
            setGameFadeIn(true);

            setTimeout(() => pickNextCard(allCards, []), 50);

            setCurrentCard(null);
        }
    };

    return (
        <>
            {showEnding ? (
                <div
                    className="ending-screen"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        overflow: 'hidden',
                        zIndex: 1000, // 다른 화면보다 항상 위에
                    }}
                >
                    {/* ✅ 배경 이미지 */}
                    {endingImage && (
                        <img
                            src={endingImage}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'fill',
                                zIndex: 0,
                            }}
                        />
                    )}

                    {/* ✅ 오버레이 */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                        }}
                    >
                        {/* ✅ 텍스트 박스 */}
                        <div
                            className="ending-content"
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                padding: '50px',
                                borderRadius: '16px',
                                maxWidth: '600px',
                                textAlign: 'center',
                                zIndex: 2,
                            }}
                        >
                            <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>🎬 엔딩 {endingType}</h1>
                            <p style={{ fontSize: '18px', lineHeight: '1.6', marginTop: '50px' }}>{endingText}</p>
                            <p style={{ marginTop: '50px', fontSize: '15px' }}>
                                당신의 선택은 이런 결과를 가져왔습니다.
                            </p>
                            <div className="ending-buttons" style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '100px' }}>
                                <button onClick={() => handleStart(true)}>🔁 다시하기</button>
                                <button onClick={() => window.location.href = '/'}>📤 업로드페이지로 가기</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : showIntro ? (
                <div
                    className={`intro-screen ${fadeOut ? 'fade-out' : ''}`}
                    style={{
                        backgroundImage: scenarios.length > 0 ? `url(${scenarios[0].image})` : 'none',
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }} />
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <h1>🌿 탄소 정책 게임에 오신 걸 환영합니다!</h1>

                        {/* 시나리오 텍스트 삽입 */}
                        <p style={{ fontSize: '18px', maxWidth: '600px', margin: '20px auto' }}>
                            {scenarios.length > 0
                                ? scenarios[0].data?.['텍스트'] || '[❗ 시나리오 텍스트 없음]'
                                : '시나리오 설명을 불러오는 중...'}
                        </p>

                        <button onClick={() => handleStart(false)}>🚀 게임 시작</button>
                    </div>
                </div>
            ) : (
                <div className={`game-main ${gameFadeIn ? 'fade-in' : ''}`}>
                    <>
                        {/* ✅ 상단 제목만 고정 */}
                        <div className="top-header">
                            <h2>🃏 탄소 정책 카드 게임 🃏</h2>
                        </div>

                        <div className="game-container">
                            {/* ✅ 가운데 남색 오버레이 추가 */}
                            <div className="dark-overlay" />

                            {/* ✅ 상태창 컴포넌트: 항상 오른쪽 상단 고정 */}
                            <StatusPanel carbon={carbon} happiness={happiness} budget={budget} delta={delta} researchYesCards={researchYesCountForUI} />

                            {/* ✅ 안내 문구 */}
                            <div className="game-header">
                                {/* ✅ 턴 표시 */}
                                <p style={{
                                    fontSize: '20px',
                                    color: '#ffffff',
                                    marginBottom: '4px',
                                    fontWeight: '500'
                                }}>
                                    🎲 턴 {currentIndex + 1} / {20} 🎲
                                </p>

                                <p>드래그로 카드를 좌우로 넘겨보세요</p>
                            </div>

                            {/* ✅ 연구 카드 발동시 팝업 */}
                            {showResearchPopup && researchCompleteCard && (
                                <div className="research-effect-popup">
                                    <div className="popup-inner">
                                        <span className="icon">🔬</span>
                                        <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFB347' }}>
                                            연구 추가 효과 발동!
                                        </p>
                                        {/* 제목 */}
                                        <h3 style={{ marginTop: '10px', fontSize: '18px', color: '#ff6f00', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)' }}>
                                            {researchCompleteCard.title}
                                        </h3>

                                        {/* 한줄 설명 */}
                                        <p style={{ fontSize: '16px', color: '#555', marginTop: '4px' }}>
                                            {researchCompleteCard.description}
                                        </p>

                                        {/* 효과 */}
                                        <ul style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            marginTop: '10px',
                                            fontSize: '15px',
                                            lineHeight: '1.8',
                                            color: '#000'
                                        }}>
                                            <li>🌍 탄소: {researchCompleteCard.effects?.carbon ?? 0}</li>
                                            <li>💰 예산: {researchCompleteCard.effects?.budget ?? 0}</li>
                                            <li>😊 행복도: {researchCompleteCard.effects?.happiness ?? 0}</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* ✅ 카드 스택 */}
                            <div className="card-stack">
                                {/* ✅ 카드를 스와이프 하거나 없을 때도 보여질 고정 배경 */}
                                <div className="card-background" />

                                {/* ✅ 스와이프 카드 */}
                                {currentCard ? (
                                    <>
                                        {console.log('[🧩 TinderCard 렌더링]', currentCard)}
                                        <TinderCard
                                            key={`${currentCard.cardNumber}-${currentIndex}`}  // 중복방지
                                            className="tinder-card"
                                            onSwipe={handleSwipe}
                                            onCardLeftScreen={() => {
                                                // 👇 카드 완전히 사라지면 잠금 해제 (안정성 ↑)
                                                setIsSwiping(false);
                                            }}
                                            preventSwipe={
                                                currentCard.type === '재난' ? ['left', 'up', 'down'] : ['up', 'down']
                                            }
                                            swipeRequirementType="position"
                                            swipeThreshold={150}
                                        >
                                            <div
                                                className={`card ${currentCard.type === '재난'
                                                    ? 'flash-shake-in-card'
                                                    : currentCard.type === '연구'
                                                        ? 'research-glow-in-card'
                                                        : 'fade-in-card'
                                                    }`}
                                                style={{
                                                    backgroundColor: cardTypeStyles[currentCard.type]?.lightColor,
                                                    border: `5px solid ${cardTypeStyles[currentCard.type]?.color}`,
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    transition: 'opacity 0.2s ease',
                                                    opacity: isSwiping ? 0.5 : 1,
                                                    pointerEvents: isSwiping ? 'none' : 'auto'
                                                }}
                                            >
                                                {/* ✅ 상단 라벨 + 타이틀 헤더 */}
                                                <div
                                                    style={{
                                                        backgroundColor: cardTypeStyles[currentCard.type]?.color,
                                                        color: 'white',
                                                        padding: '20px 12px',
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr auto 1fr',
                                                        alignItems: 'center',
                                                        fontWeight: '600',
                                                        fontSize: '20px',
                                                        width: '100%',
                                                        boxSizing: 'border-box',
                                                        height: '70px', // ✅ 고정 높이 추가
                                                        lineHeight: '1.3',
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    <div style={{ textAlign: 'left' }}>
                                                        {currentCard.type === '재난' ? '' : '❌ No'}
                                                    </div>
                                                    <div
                                                        style={{
                                                            textAlign: 'center',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            wordBreak: 'keep-all',        // 단어 기준 줄바꿈
                                                            whiteSpace: 'normal',         // 여러 줄 허용
                                                            maxWidth: '180px',         // ✅ 너비 제한!
                                                            margin: '0 auto',          // ✅ 가운데 정렬
                                                            lineHeight: '1.3',
                                                            fontSize: '18px',
                                                        }}
                                                    >
                                                        {currentCard.title}
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>✅ Yes</div>
                                                </div>

                                                {/* 본문 */}
                                                {/* ⬆️ 상단: 아이콘 + 유형 */}
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{
                                                        width: '82px',
                                                        height: '82px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#fafafa',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '36px',
                                                        marginTop: '20px',
                                                        marginLeft: 'auto',
                                                        marginRight: 'auto',
                                                        boxShadow: `0 0 6px 2px ${cardTypeStyles[currentCard.type]?.color}44`
                                                    }}>
                                                        {cardTypeStyles[currentCard.type]?.icon}
                                                    </div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '20px', marginTop: '10px', color: cardTypeStyles[currentCard.type]?.color }}>
                                                        {currentCard.type}
                                                    </div>

                                                    {/* ✅ 안내 메시지: 재난 유형일 때만 */}
                                                    {currentCard.type === '재난' && (
                                                        <div
                                                            className="disaster-warning"
                                                            style={{
                                                                marginTop: '6px',
                                                                fontSize: '13px',
                                                                color: '#d32f2f',
                                                                fontWeight: '600',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                            }}
                                                        >
                                                            <span>❗</span>
                                                            <span>재난 카드는 무조건 YES만 가능합니다</span>
                                                        </div>
                                                    )}

                                                    {/* ✅ 안내 메시지: 연구 유형일 때만 */}
                                                    {currentCard.type === '연구' && researchYesCountForUI.length < 3 && (
                                                        <div
                                                            className="research-warning"
                                                            style={{
                                                                marginTop: '6px',
                                                                fontSize: '13px',
                                                                color: '#ff9800', // 주황 계열 (연구 느낌)
                                                                fontWeight: '600',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                            }}
                                                        >
                                                            <span>🔬</span>
                                                            <span>연구 카드는 3장을 모두 YES 선택해야 효과가 발동됩니다</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ✅ 설명만 유동적 */}
                                                <div style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '16px 20px',
                                                }}>
                                                    <p style={{
                                                        fontSize: '16px',
                                                        margin: '0 auto',
                                                        textAlign: 'center',
                                                        color: '#000',
                                                        lineHeight: '1.6'
                                                    }}>
                                                        {currentCard.description}
                                                    </p>
                                                </div>

                                                {/* ✅ 효과 (항상 카드번호 위에 고정) */}
                                                <div style={{
                                                    textAlign: 'center',
                                                    marginBottom: '20px'
                                                }}>
                                                    <ul style={{
                                                        listStyle: 'none',
                                                        padding: 0,
                                                        margin: 0,
                                                        lineHeight: '2',
                                                        fontSize: '15px'
                                                    }}>
                                                        <li>🌍 탄소: {currentCard.effects?.carbon ?? 0}</li>
                                                        <li>💰 예산: {currentCard.effects?.budget ?? 0}</li>
                                                        <li>😊 행복도: {currentCard.effects?.happiness ?? 0}</li>
                                                    </ul>
                                                </div>

                                                {/* ⬇️ 하단: 카드 번호 (항상 아래) */}
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    backgroundColor: cardTypeStyles[currentCard.type]?.color,
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    textAlign: 'center',
                                                    lineHeight: '28px',
                                                    marginLeft: 'auto',
                                                    marginRight: 'auto',
                                                    marginBottom: '20px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {currentCard.cardNumber}
                                                </div>

                                            </div>
                                        </TinderCard>
                                    </>
                                ) : (
                                    !showIntro && !showEnding ? (
                                        // 초기 카드 로딩 중
                                        < p style={{ fontSize: '18px', color: '#333', marginTop: '20px' }}>
                                            카드를 불러오는 중입니다...
                                        </p>
                                    ) : (
                                        // 진짜 끝
                                        < p style={{ fontSize: '18px', color: '#333', marginTop: '20px' }}>
                                            🎉 모든 카드를 넘겼습니다!
                                        </p>
                                    )
                                )}
                            </div>
                        </div>
                    </>
                </div >
            )
            }
        </>
    );
}

export default GamePage;