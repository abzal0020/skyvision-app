import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

/*
  Пример замены вашей секции "Create new factory".
  - Блокировка кнопки пока идёт запрос (creating)
  - Простая генерация slug из имени, если slug не задан
  - Показывает сообщение об успехе/ошибке
  - Защищает от повторных кликов (если creating === true — форма игнорирует)
*/

export default function FactoryCreateForm({ onCreated }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState(null);

  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/\-+/g, "-")
      .replace(/(^\-|\-$)/g, "");
  };

  const handleCreate = async (e) => {
    e && e.preventDefault();
    if (creating) return; // защита от повторных нажатий

    if (!name.trim()) {
      setMsg({ type: "error", text: "Введите имя завода" });
      return;
    }

    setCreating(true);
    setMsg(null);

    const finalSlug = (slug && slug.trim()) ? slug.trim() : generateSlug(name);

    try {
      const payload = {
        id: uuidv4(),
        name: name.trim(),
        slug: finalSlug,
        published: true
      };

      const start = Date.now();
      const { data, error } = await supabase
        .from("factories")
        .insert([payload])
        .select() // получить вставленную запись в ответе
        .maybeSingle();
      const duration = Date.now() - start;

      if (error) {
        // Если slug уже существует — Supabase вернёт ошибку уникальности (если есть constraint)
        throw error;
      }

      setMsg({ type: "success", text: "Завод создан" + (duration ? ` (время: ${duration} ms)` : "") });
      setName("");
      setSlug("");
      if (typeof onCreated === "function") onCreated(data);
    } catch (err) {
      console.error("Create factory error", err);
      // Показываем читаемое сообщение пользователю
      const text = err?.message || (err?.error_description) || String(err);
      setMsg({ type: "error", text });
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
      <h3>Create new factory</h3>

      <div>
        <label>Name</label><br />
        <input value={name} onChange={(e) => setName(e.target.value)} disabled={creating} />
      </div>

      <div style={{ marginTop: 8 }}>
        <label>Slug (optional, unique)</label><br />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} disabled={creating} placeholder="если пусто — сгенерируется" />
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="submit" disabled={creating} style={{ padding: "6px 12px" }}>
          {creating ? "Создаётся..." : "Create"}
        </button>
      </div>

      {msg && (
        <div style={{ marginTop: 8, color: msg.type === "error" ? "crimson" : "green" }}>
          {msg.text}
        </div>
      )}
    </form>
  );
}
