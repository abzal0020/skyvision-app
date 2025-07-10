// RequestModal.js  (src/components)
import React, { useState } from "react";
import emailjs from "emailjs-com";          // ← 1) импорт emailjs

function RequestModal({ factoryName, onClose }) {
  const [step, setStep]   = useState(0);      // 0-данные, 1-календарь, 2-подтверждение
  const today             = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name:    "",
    phone:   "",
    wechat:  "",
    city:    "Костанай",
    cargo:   "Кормовая мука",
    station: "Хоргос",
    planGU:  "Нет",
    date:    today,
  });

  /* ---------------- handlers ---------------- */
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const next   = () => setStep(s => s + 1);
  const back   = () => setStep(s => s - 1);

  // 👉 2) функция отправки
  const submit = () => {
    const payload = { ...form, factory: factoryName };

    emailjs                    //   ← используем ваши 3 ID
      .send(
        "service_mfs129i",     // Service ID
        "template_vixeuwf",    // Template ID
        payload,
        "5hS_rdfopL-fNCVzY"    // Public Key
      )
      .then(() => {
        alert("✅ Заявка отправлена! Скоро свяжемся.");
        onClose();
      })
      .catch(() => alert("Ошибка отправки, попробуйте позже."));
  };

  /* ---------------- простая валидация ---------------- */
  const canNext = () => {
    if (step === 0) return form.name && form.phone;
    if (step === 1) return !!form.date;
    return true;
  };

  /* ---------------- UI ---------------- */
  return (
    
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 style={styles.title}>Заявка • {factoryName}</h2>
        <div style={styles.modal} className="modalMobileFix" onClick={e=>e.stopPropagation()}></div>
        

        {/* индикатор шагов */}
        <div style={styles.stepsBar}>
          {["Данные", "Дата", "Проверка"].map((t, i) => (
            <div key={t} style={{ ...styles.step, ...(step === i && styles.stepActive) }}>{i + 1}</div>
          ))}
        </div>

        {step === 0 && (
          <>
            <input name="name"    value={form.name}    onChange={handle} placeholder="Имя"       style={styles.input}/>
            <input name="phone"   value={form.phone}   onChange={handle} placeholder="Телефон"   style={styles.input}/>
            <input name="wechat"  value={form.wechat}  onChange={handle} placeholder="WeChat"    style={styles.input}/>
            <select name="city"   value={form.city}    onChange={handle} style={styles.input}>
              <option>Костанай</option><option>Рудный</option>
            </select>
            <select name="cargo"  value={form.cargo}   onChange={handle} style={styles.input}>
              <option>Кормовая мука</option><option>Ячмень</option>
            </select>
            <select name="station" value={form.station} onChange={handle} style={styles.input}>
              <option>Хоргос</option><option>Алтынколь</option>
            </select>
            <select name="planGU" value={form.planGU}  onChange={handle} style={styles.input}>
              <option>с планом ГУ</option><option>без плана</option>
            </select>
          </>
        )}

        {step === 1 && (
          <>
            <label style={styles.label}>Дата погрузки</label>
            <input type="date" name="date" min={today} value={form.date} onChange={handle} style={styles.input}/>
          </>
        )}

        {step === 2 && (
          <div style={styles.review}>
            {Object.entries({
              Имя: form.name, Телефон: form.phone, WeChat: form.wechat,
              Город: form.city, Груз: form.cargo, Станция: form.station,
              "План ГУ": form.planGU, "Дата погрузки": form.date,
            }).map(([k,v])=> <p key={k}><strong>{k}:</strong> {v}</p>)}
          </div>
        )}

        {/* кнопки */}
        <div style={styles.btnRow}>
          <button onClick={onClose} style={styles.btnGrey}>Отмена</button>
          {step>0   && <button onClick={back}   style={styles.btnGrey}>Назад</button>}
          {step<2   && <button onClick={next}   disabled={!canNext()} style={{ ...styles.btnBlue, opacity: canNext()?1:.5 }}>Далее</button>}
          {step===2 && <button onClick={submit} style={styles.btnBlue}>Отправить</button>}
        </div>
      </div>
    </div>
  );
}

/* ---------- inline-стили ---------- */
const styles = {
  backdrop:{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:1000},
  modal:{background:"#fff",borderRadius:12,padding:24,width:"95%",maxWidth:480,boxShadow:"0 10px 30px rgba(0,0,0,.2)"},
  title:{margin:0,marginBottom:18,color:"#000080",textAlign:"center"},
  stepsBar:{display:"flex",justifyContent:"center",gap:8,marginBottom:20},
  step:{width:24,height:24,borderRadius:"50%",background:"#ccc",color:"#fff",fontSize:14,display:"flex",justifyContent:"center",alignItems:"center"},
  stepActive:{background:"#000080"},
  input:{width:"100%",padding:10,marginBottom:12,borderRadius:6,border:"1px solid #ccc",fontSize:14},
  label:{marginBottom:6,fontWeight:"bold"},
  review:{maxHeight:240,overflowY:"auto"},
  btnRow:{marginTop:10,display:"flex",justifyContent:"flex-end",gap:8},
  btnBlue:{background:"#000080",color:"#fff",border:"none",padding:"10px 20px",borderRadius:6,cursor:"pointer"},
  btnGrey:{background:"#bbb",color:"#000",border:"none",padding:"10px 20px",borderRadius:6,cursor:"pointer"},
};

export default RequestModal;
