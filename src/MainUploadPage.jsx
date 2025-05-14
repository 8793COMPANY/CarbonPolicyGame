// 📦 엑셀 라이브러리 추가
import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import './scrollbar.css';

function MainUploadPage() {
  // const [cardImages, setCardImages] = useState([]);
  const [scenarioImages, setScenarioImages] = useState([]);
  const [cardExcelData, setCardExcelData] = useState([]);
  const [scenarioExcelData, setScenarioExcelData] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [matchedScenarios, setMatchedScenarios] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [showErrors, setShowErrors] = useState(false);

  const [selectedCardExcelName, setSelectedCardExcelName] = useState('');
  const [selectedScenarioExcelName, setSelectedScenarioExcelName] = useState('');

  const navigate = useNavigate();
  const errorRef = useRef(null); // error 메시지 영역에 사용할 ref
  const resultRef = useRef(null); // 매칭 결과 영역에 사용할 ref

  const cardExcelInputRef = useRef(null);
  const scenarioExcelInputRef = useRef(null);
  // const cardImageInputRef = useRef(null);
  const scenarioImageInputRef = useRef(null);

  useEffect(() => {
    if (showErrors) {
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100); // 0.1초 뒤 실행
    }
  }, [showErrors]); // showErrors가 true로 바뀔 때 에러 위치로 스크롤

  const hiddenInputStyle = {
    display: 'none'
  };

  const uploadButtonStyle = {
    display: 'inline-block',
    margin: '8px 0',
    padding: '10px 18px',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.3s'
  };

  const removeButtonStyle = {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    cursor: 'pointer',
    padding: '0',
    fontSize: '16px',
    lineHeight: '22px',
    textAlign: 'center'
  };

  // const handleCardImageUpload = (e) => {
  //   const files = Array.from(e.target.files);
  //   setCardImages((prev) => [...prev, ...files]);
  // };

  const handleScenarioImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setScenarioImages((prev) => [...prev, ...files]);
  };

  const handleCardExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);
    console.log("Card Excel Raw Data:", json);
    setCardExcelData(json);
  };

  const handleScenarioExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);
    console.log("Scenario Excel Raw Data:", json);
    setScenarioExcelData(json);
  };

  // const removeCardImage = (index) => {
  //   setCardImages((prev) => {
  //     const updated = prev.filter((_, i) => i !== index);
  //     if (cardImageInputRef.current) {
  //       cardImageInputRef.current.value = ''; // 항상 초기화
  //     }
  //     return updated;
  //   });
  // };

  const removeScenarioImage = (index) => {
    setScenarioImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (scenarioImageInputRef.current) {
        scenarioImageInputRef.current.value = ''; // 항상 초기화
      }
      return updated;
    });
  };

  const resetCardExcel = () => {
    setCardExcelData([]);
    setSelectedCardExcelName('');
    if (cardExcelInputRef.current) {
      cardExcelInputRef.current.value = '';
    }
  }

  const resetScenarioExcel = () => {
    setScenarioExcelData([]);
    setSelectedScenarioExcelName('');
    if (scenarioExcelInputRef.current) {
      scenarioExcelInputRef.current.value = '';
    }
  }

  const matchCards = () => {
    setShowErrors(false); // 오류 초기화
    setTimeout(() => {
      const errors = [];

      // 1️⃣ 필수 업로드 항목 확인
      // if (!cardImages.length) errors.push("🖼️ 카드 이미지가 업로드되지 않았습니다.");
      if (!cardExcelData.length) errors.push("📄 카드 엑셀 파일이 업로드되지 않았습니다.");
      if (!scenarioImages.length) errors.push("🎬 시나리오 이미지가 업로드되지 않았습니다.");
      if (!scenarioExcelData.length) errors.push("📄 시나리오 엑셀 파일이 업로드되지 않았습니다.");

      // 2️⃣ 파일명 형식 오류 확인
      const cardNumbers = cardExcelData.map(row => String(row['번호']).trim());
      const scenarioNumbers = scenarioExcelData.map(row => String(row['번호']).trim());

      const duplicateCardNumbers = cardNumbers.filter((v, i, arr) => arr.indexOf(v) !== i);
      if (duplicateCardNumbers.length > 0) {
        errors.push(`⚠️ 카드 엑셀에 중복 번호가 있습니다: ${[...new Set(duplicateCardNumbers)].join(', ')}`);
      }

      const duplicateScenarioNumbers = scenarioNumbers.filter((v, i, arr) => arr.indexOf(v) !== i);
      if (duplicateScenarioNumbers.length > 0) {
        errors.push(`⚠️ 시나리오 엑셀에 중복 번호가 있습니다: ${[...new Set(duplicateScenarioNumbers)].join(', ')}`);
      }

      // const invalidCardImageNames = cardImages.filter(file => !/^\d+_/.test(file.name));
      // if (invalidCardImageNames.length > 0) {
      //   errors.push(`🖼️ 카드 이미지 파일명 오류: ${invalidCardImageNames.map(f => f.name).join(', ')}`);
      // }

      const invalidScenarioImageMessages = scenarioImages
        .map(file => {
          const name = file.name;
          if (!/^\d+_/.test(name)) {
            if (!/^\d+/.test(name)) return `❌ ${name} → 앞에 숫자가 없습니다`;
            if (!/^\d+_/.test(name)) return `❌ ${name} → 숫자 뒤에 '_'가 없습니다`;
            return `❌ ${name} → 형식 오류`;
          }
          return null;
        })
        .filter(Boolean);

      if (invalidScenarioImageMessages.length > 0) {
        errors.push(`🎬 시나리오 이미지 파일명 오류:\n` + invalidScenarioImageMessages.join('\n'));
      }

      // 3️⃣ 카드 매칭
      const cardMatches = [];
      cardExcelData.forEach((row) => {
        const cardNumber = String(row['번호']).trim();
        const text = row['제목'] || '(카드 텍스트 없음)';
        // const matchedImage = cardImages.find((file) => file.name.split('_')[0] === cardNumber);

        // if (!matchedImage) {
        //   errors.push(`❌ 카드 이미지가 없습니다. (번호: ${cardNumber})`);
        //   return;
        // }

        cardMatches.push({
          cardNumber,
          // image: URL.createObjectURL(matchedImage),
          text,
          data: row  // 📌 카드 엑셀의 모든 열 데이터 포함
        });
      });

      // 4️⃣ 시나리오 매칭
      const scenarioMatches = [];
      scenarioExcelData.forEach((row) => {
        const scenarioNumber = String(row['번호']).trim();
        const scenarioText = row['내용'] || '(시나리오 텍스트 없음)';
        const matchedImage = scenarioImages.find((file) => file.name.split('_')[0] === scenarioNumber);

        if (!matchedImage) {
          errors.push(`❌ 시나리오 이미지가 없습니다. (번호: ${scenarioNumber})`);
          return;
        }

        scenarioMatches.push({
          scenarioNumber,
          image: URL.createObjectURL(matchedImage),
          scenarioText,
          data: row  // 📌 시나리오 엑셀의 모든 열 데이터 포함
        });
      });

      // ✅ 5️⃣ 오류가 있을 경우 중단하고 오류만 보여주기
      setErrorMessages(errors);
      if (errors.length > 0) {
        // setErrorMessages(errors);
        setMatchedCards([]);
        setMatchedScenarios([]);
        setShowErrors(true); // 강제로 다시 트리거
        return;
      }

      // ✅ 6️⃣ 성공적으로 매칭된 결과 저장
      setMatchedCards(cardMatches);
      setMatchedScenarios(scenarioMatches);

      // 매칭 결과로 스크롤 이동
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      setShowErrors(true);
    }, 0);
  };

  const readyToStart =
    matchedCards.length > 0 &&
    matchedScenarios.length > 0 &&
    matchedCards.length === cardExcelData.length &&
    matchedScenarios.length === scenarioExcelData.length;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '20px'
      }}
    >
      <div
        className="scrollbox"
        style={{
          width: '100%',
          maxWidth: '900px',
          height: '80vh',               // ✅ 고정 높이 (또는 maxHeight)
          overflowY: 'auto',            // ✅ 스크롤 가능하게
          padding: '30px 30px',
          borderRadius: '16px',
          backgroundColor: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}
      >
        <h2 style={{ marginTop: '50px', marginBottom: '20px', fontSize: '28px' }}>🌱 탄소 중립 정책 카드 게임을 시작하려면</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '50px' }}>
          왼쪽 영역에서는 <strong>시나리오 설명 엑셀</strong>과 <strong>시나리오 이미지</strong>를 업로드하고,<br />
          오른쪽 영역에서는 <strong>카드 정보 엑셀</strong>을 업로드해주세요.<br /><br />
          번호를 기준으로 이미지 파일명과 엑셀 데이터가 자동으로 매칭됩니다.<br />
          예를 들어, 엑셀에서 번호가 <strong>3</strong>인 행이 있다면, <code>3_scenario.jpg</code>, <code>3_scenario.png</code> 등의 이미지와 연결됩니다.
          {/* 왼쪽 영역에서는 <strong>카드 이미지</strong>와 <strong>카드 정보 엑셀</strong>을 업로드하고,<br />
          오른쪽 영역에서는 <strong>시나리오 이미지</strong>와 <strong>시나리오 설명 엑셀</strong>을 업로드해주세요.<br /><br />
          번호(예: 1, 2...)를 기준으로 이미지 파일명과 엑셀 데이터가 자동으로 매칭됩니다.<br />
          예시: <code>3_card.jpg</code> + 카드엑셀 '3'행 / <code>3_scenario.png</code> + 시나리오엑셀 '3'행 */}
        </p>

        {/* ✅ 그리드 적용 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: 'auto auto auto',
            gap: '40px',
            alignItems: 'start'
          }}
        >

          {/* ──────────────── 1행: 이미지 업로드 버튼 ──────────────── */}
          {/* <div style={{ textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 카드 이미지 업로드</label>
            <label htmlFor="card-image-upload" style={uploadButtonStyle}>카드 이미지 선택</label>
            <input
              id="card-image-upload"
              ref={cardImageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleCardImageUpload}
              style={hiddenInputStyle}
            />
            {cardImages.length > 0 && (
              <div style={{ marginTop: '6px', fontSize: '13px', color: '#555' }}>
                {cardImages.length}개 이미지 선택됨
              </div>
            )}
          </div> */}

          <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3', textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>🎬 시나리오 이미지 업로드</label>
            <label htmlFor="scenario-image-upload" style={uploadButtonStyle}>시나리오 이미지 선택</label>
            <input
              id="scenario-image-upload"
              ref={scenarioImageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleScenarioImageUpload}
              style={hiddenInputStyle}
            />
            {scenarioImages.length > 0 && (
              <div style={{ marginTop: '6px', fontSize: '13px', color: '#555' }}>
                {scenarioImages.length}개 이미지 선택됨
              </div>
            )}
          </div>

          {/* ──────────────── 2행: 이미지 미리보기 영역 ──────────────── */}
          {/* <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', padding: '0', lineHeight: 0 }}>
            {cardImages.map((file, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img src={URL.createObjectURL(file)} alt={`card-preview-${idx}`} width="60" height="60"
                  style={{ borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd' }} />
                <button onClick={() => removeCardImage(idx)} style={removeButtonStyle}>×</button>
              </div>
            ))}
          </div> */}

          <div style={{ gridColumn: '1 / 2', gridRow: '3 / 4', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', padding: '0', lineHeight: 0 }}>
            {scenarioImages.map((file, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img src={URL.createObjectURL(file)} alt={`scenario-preview-${idx}`} width="60" height="60"
                  style={{ borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd' }} />
                <button onClick={() => removeScenarioImage(idx)} style={removeButtonStyle}>×</button>
              </div>
            ))}
          </div>

          {/* ──────────────── 3행: 엑셀 업로드 버튼 ──────────────── */}
          <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2', textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>📄 카드 엑셀 업로드</label>
            <label htmlFor="card-excel-upload" style={uploadButtonStyle}>카드 엑셀 선택</label>
            <input
              id="card-excel-upload"
              ref={cardExcelInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                handleCardExcelUpload(e);
                setSelectedCardExcelName(e.target.files[0]?.name || '');
              }}
              style={hiddenInputStyle}
            />
            {selectedCardExcelName && (
              <div style={{ marginTop: '6px', fontSize: '14px', color: 'black' }}>
                선택된 파일: {selectedCardExcelName}
              </div>
            )}
            {cardExcelData.length > 0 && (
              <button onClick={resetCardExcel} style={{ marginTop: '8px', fontSize: '12px', backgroundColor: '#ddd' }}>❌ 초기화</button>
            )}
          </div>

          <div style={{ gridColumn: '1 / 2', gridRow: '1 / 2', textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>📄 시나리오 엑셀 업로드</label>
            <label htmlFor="scenario-excel-upload" style={uploadButtonStyle}>시나리오 엑셀 선택</label>
            <input
              id="scenario-excel-upload"
              ref={scenarioExcelInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                handleScenarioExcelUpload(e);
                setSelectedScenarioExcelName(e.target.files[0]?.name || '');
              }}
              style={hiddenInputStyle}
            />
            {selectedScenarioExcelName && (
              <div style={{ marginTop: '6px', fontSize: '14px', color: 'black' }}>
                선택된 파일: {selectedScenarioExcelName}
              </div>
            )}
            {scenarioExcelData.length > 0 && (
              <button onClick={resetScenarioExcel} style={{ marginTop: '8px', fontSize: '12px', backgroundColor: '#ddd' }}>❌ 초기화</button>
            )}
          </div>
        </div>

        {/* 🔄 이미지와 데이터 매칭하기 버튼 */}
        <div style={{ marginTop: '50px', marginBottom: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={matchCards}
            style={{
              padding: '10px 20px',
              backgroundColor: '#cce3dc',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: '#222'
            }}
          >
            🔄 이미지와 데이터 매칭하기
          </button>

          {/* 🎴 테스트 이동 버튼 바로 아래에! */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => navigate('/game')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#eee',
                border: '1px solid #ccc',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              🎴 게임 화면 테스트로 이동
            </button>
          )}
        </div>

        {showErrors && errorMessages.length > 0 && (
          <div ref={errorRef} style={{
            textAlign: 'left',
            backgroundColor: '#ffecec',
            border: '1px solid #f5c2c2',
            padding: '20px 15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <strong style={{ color: '#d32f2f' }}>⚠️ 오류가 발생했습니다:</strong>
            <ul style={{ marginTop: '8px' }}>
              {errorMessages.map((msg, idx) => (
                <li key={idx} style={{ color: '#b71c1c', fontSize: '14px' }}>{msg}</li>
              ))}
            </ul>
            <p style={{ marginTop: '12px', marginLeft: '12px', color: '#b71c1c', fontSize: '13px' }}>
              오류를 모두 해결한 후 다시 시도해주세요.
            </p>
          </div>
        )}

        {matchedCards.length > 0 || matchedScenarios.length > 0 ? (
          <div ref={resultRef} style={{ marginTop: '30px' }}>
            <h3 style={{ marginTop: '20px', marginBottom: '20px' }}>📝 매칭 결과 미리보기</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                alignItems: 'flex-start'
              }}
            >
              {/* 왼쪽: 시나리오 결과 */}
              <div>
                <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>📘 시나리오 정보</h5>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {matchedScenarios.map((scn, idx) => (
                    <li key={idx} style={{ marginBottom: '20px' }}>
                      <strong>번호 {scn.scenarioNumber}</strong><br />
                      <img src={scn.image} alt={`scenario-${scn.scenarioNumber}`} width="80" height="80" style={{
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid #ccc',
                        marginTop: '6px'
                      }} />
                      {/* <p style={{ fontSize: '14px', marginTop: '8px', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{scn.scenarioText}</p> */}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 오른쪽: 카드 결과 */}
              <div>
                <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>📇 카드 정보</h5>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {matchedCards.map((card, idx) => (
                    <li key={idx} style={{ marginBottom: '20px' }}>
                      <strong>번호 {card.cardNumber}</strong><br />
                      {/* <img src={card.image} alt={`card-${card.cardNumber}`} width="80" height="80" style={{
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid #ccc',
                        marginTop: '6px'
                      }} /> */}
                      <p style={{ fontSize: '14px', marginTop: '8px', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{card.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {readyToStart && (
          <button
            onClick={() => {
              console.log('[🔥 게임 시작 시점 matchedCards]', matchedCards);
              console.log('[🔥 게임 시작 시점 matchedScenarios]', matchedScenarios);

              // localStorage에 저장
              localStorage.setItem('matchedCards', JSON.stringify(matchedCards));
              localStorage.setItem('matchedScenarios', JSON.stringify(matchedScenarios));

              // 페이지 이동
              navigate('/game');
            }}
            style={{
              marginTop: '20px',
              padding: '10px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#a3d2ca',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🚀 게임 시작
          </button>
        )}
      </div>
    </div>
  );
}

export default MainUploadPage;