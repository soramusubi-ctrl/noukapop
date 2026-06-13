"use client";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Download,
  Home,
  Image as ImageIcon,
  Instagram,
  Leaf,
  Menu,
  MessageSquareText,
  Newspaper,
  Palette,
  Plus,
  Printer,
  RotateCcw,
  Save,
  ShoppingBasket,
  Sparkles,
  Sprout,
  Sticker,
  Upload,
  Wheat,
  X,
} from "lucide-react";
import { toPng } from "html-to-image";
import { ChangeEvent, useRef, useState } from "react";

type CategoryId = "market" | "sns" | "letter" | "brand";
type OutputId =
  | "pop"
  | "price"
  | "recipe"
  | "list"
  | "instagram"
  | "story"
  | "letter"
  | "profile"
  | "message"
  | "sticker";

type FormData = {
  vegetable: string;
  price: string;
  note: string;
  recipe: string;
  recommendation: string;
  farm: string;
  account: string;
  items: string;
  image: string;
  cropX: number;
  cropY: number;
};

const categories: {
  id: CategoryId;
  title: string;
  subtitle: string;
  icon: typeof ShoppingBasket;
  tone: string;
  outputs: OutputId[];
}[] = [
  {
    id: "market",
    title: "売り場",
    subtitle: "POPや価格カードで、売り場を魅力的に。",
    icon: ShoppingBasket,
    tone: "green",
    outputs: ["pop", "price", "recipe", "list"],
  },
  {
    id: "sns",
    title: "SNS",
    subtitle: "今日の野菜を、すぐに投稿。",
    icon: Instagram,
    tone: "terracotta",
    outputs: ["instagram", "story"],
  },
  {
    id: "letter",
    title: "おたより",
    subtitle: "畑の様子や感謝を、やさしく届ける。",
    icon: Newspaper,
    tone: "ochre",
    outputs: ["letter", "message", "profile"],
  },
  {
    id: "brand",
    title: "ブランド",
    subtitle: "農園らしさを、ラベルやシールに。",
    icon: Sticker,
    tone: "sage",
    outputs: ["sticker"],
  },
];

const outputs: Record<
  OutputId,
  { title: string; small: string; size: string; category: CategoryId; templates: string[] }
> = {
  pop: { title: "直売所POP", small: "写真を大きく、旬を伝える", size: "A5 横", category: "market", templates: ["ナチュラル", "にぎやか", "シンプル"] },
  price: { title: "価格カード", small: "見やすく、量産しやすい", size: "小カード", category: "market", templates: ["余白たっぷり", "クラフト", "青果店風"] },
  recipe: { title: "食べ方カード", small: "おすすめの食べ方を添える", size: "はがき", category: "market", templates: ["やさしいレシピ", "写真入り", "メモ風"] },
  list: { title: "今日出せる野菜リスト", small: "今日の品揃えをひと目で", size: "A5 縦", category: "market", templates: ["メモ紙", "黒板風", "シンプル"] },
  instagram: { title: "Instagram投稿", small: "写真とひとことで投稿", size: "1 : 1", category: "sns", templates: ["今日のお野菜", "今日のひとこと", "旬です"] },
  story: { title: "ストーリー / リール表紙", small: "縦長で大きく目を引く", size: "9 : 16", category: "sns", templates: ["とれたて", "畑から", "入荷しました"] },
  letter: { title: "月のおたより", small: "畑の今を、紙ものに", size: "A4 縦", category: "letter", templates: ["やさしい便り", "写真入り", "季節のお知らせ"] },
  profile: { title: "農家紹介カード", small: "想いや栽培方針を伝える", size: "A5 縦", category: "letter", templates: ["はじめまして", "農園の想い", "プロフィール"] },
  message: { title: "メッセージカード", small: "小さな感謝を商品に添える", size: "小カード", category: "letter", templates: ["ありがとう", "またどうぞ", "季節のごあいさつ"] },
  sticker: { title: "ロゴシール / ブランドラベル", small: "袋や箱に農園らしさを", size: "丸シール", category: "brand", templates: ["丸シール", "横ラベル", "ロゴ風"] },
};

const initialData: FormData = {
  vegetable: "完熟トマト",
  price: "320",
  note: "甘みと酸味のバランスが自慢。畑で赤くなるまで待ちました。",
  recipe: "薄く切って、塩とオリーブオイルをひと回し。冷やしてどうぞ。",
  recommendation: "今がいちばんおいしい季節です。",
  farm: "やさし畑農園",
  account: "@yasashi_batake",
  items: "完熟トマト\nサニーレタス\n新じゃがいも\nスナップえんどう",
  image: "",
  cropX: 50,
  cropY: 50,
};

const palette = ["#5b7138", "#a45338", "#b18436", "#385f50"];

export function NoukaPop() {
  const [screen, setScreen] = useState<"home" | "choose" | "studio">("home");
  const [category, setCategory] = useState<CategoryId>("market");
  const [output, setOutput] = useState<OutputId>("pop");
  const [template, setTemplate] = useState(0);
  const [accent, setAccent] = useState(palette[0]);
  const [data, setData] = useState<FormData>(initialData);
  const [saved, setSaved] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  function openCategory(id: CategoryId) {
    setCategory(id);
    setScreen("choose");
  }

  function openStudio(id: OutputId) {
    setOutput(id);
    setTemplate(0);
    setCategory(outputs[id].category);
    setScreen("studio");
    setMobilePanel(false);
  }

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("image", String(reader.result));
    reader.readAsDataURL(file);
  }

  async function downloadPng() {
    if (!previewRef.current) return;
    const image = await toPng(previewRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#f7f1e4",
    });
    const link = document.createElement("a");
    link.download = `${data.vegetable || "nouka-pop"}-${output}.png`;
    link.href = image;
    link.click();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  if (screen === "home") {
    return <HomeScreen onOpen={openCategory} onCreate={() => openStudio("pop")} />;
  }

  if (screen === "choose") {
    return (
      <ChooseScreen
        category={category}
        onBack={() => setScreen("home")}
        onOpen={openStudio}
        onCategory={openCategory}
      />
    );
  }

  return (
    <div className="studio-shell">
      <StudioHeader
        title={outputs[output].title}
        saved={saved}
        onBack={() => setScreen("choose")}
        onHome={() => setScreen("home")}
        onSave={downloadPng}
        onMobilePanel={() => setMobilePanel(true)}
      />
      <main className="studio-main">
        <EditorPanel
          output={output}
          data={data}
          template={template}
          accent={accent}
          onOutput={openStudio}
          onUpdate={update}
          onUpload={uploadImage}
          onTemplate={setTemplate}
          onAccent={setAccent}
        />
        <PreviewArea output={output} data={data} template={template} accent={accent} previewRef={previewRef} onSave={downloadPng} />
      </main>
      {mobilePanel && (
        <div className="mobile-sheet-wrap" onClick={() => setMobilePanel(false)}>
          <div className="mobile-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="sheet-close" onClick={() => setMobilePanel(false)} aria-label="閉じる"><X /></button>
            <EditorPanel
              output={output}
              data={data}
              template={template}
              accent={accent}
              onOutput={openStudio}
              onUpdate={update}
              onUpload={uploadImage}
              onTemplate={setTemplate}
              onAccent={setAccent}
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "compact" : ""}`}>
      <span className="brand-mark"><Sprout size={compact ? 18 : 23} /></span>
      <span><b>農家ポップ</b>{!compact && <small>畑から、すぐデザイン。</small>}</span>
    </div>
  );
}

function HomeScreen({ onOpen, onCreate }: { onOpen: (id: CategoryId) => void; onCreate: () => void }) {
  return (
    <div className="home-shell paper-bg">
      <header className="home-header">
        <Brand />
        <div className="header-actions">
          <button className="text-button">使いかた</button>
          <button className="text-button">保存したもの</button>
          <button className="icon-button"><Menu size={20} /></button>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><Leaf size={15} /> 農家さんのための、かんたんデザイン道具</span>
            <h1>畑の魅力を、<br /><em>やさしく</em>届けよう。</h1>
            <p>野菜の情報を一度入れるだけ。売り場のPOPも、SNS投稿も、おたよりも、迷わずすぐに作れます。</p>
            <button className="primary-button" onClick={onCreate}><Plus size={19} /> まずは作ってみる <ArrowRight size={18} /></button>
            <div className="hero-notes"><span><Check /> 登録なしで試せます</span><span><Check /> PNGですぐ保存</span></div>
          </div>
          <div className="hero-visual" aria-label="作成できるデザインの見本">
            <div className="sun-stamp">畑から<br /><b>すぐ</b>デザイン</div>
            <div className="sample-card sample-pop">
              <span className="mini-label">今が旬！</span>
              <IllustratedVegetables />
              <small>やさし畑の</small><b>完熟トマト</b><strong>¥320</strong>
            </div>
            <div className="sample-card sample-note">
              <span>畑だより</span><b>6月号</b><i>今月のおすすめ</i><p>新じゃがいも</p>
            </div>
            <div className="leaf-sketch leaf-one">⌁</div>
            <div className="leaf-sketch leaf-two">⌁</div>
          </div>
        </section>

        <section className="entrances">
          <div className="section-heading">
            <span className="eyebrow"><Wheat size={15} /> 作りたいものから選ぶ</span>
            <h2>今日は、何を作りますか？</h2>
            <p>使う場面を選ぶと、おすすめの型がすぐに見つかります。</p>
          </div>
          <div className="category-grid">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} className={`category-card ${item.tone}`} onClick={() => onOpen(item.id)}>
                  <span className="category-number">0{categories.indexOf(item) + 1}</span>
                  <span className="category-icon"><Icon /></span>
                  <span className="category-copy"><b>{item.title}</b><small>{item.subtitle}</small></span>
                  <span className="circle-arrow"><ArrowRight /></span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="steps">
          <div><span>1</span><Camera /><b>野菜を登録</b><small>写真と特徴を入力</small></div>
          <ArrowRight className="step-arrow" />
          <div><span>2</span><Palette /><b>型を選ぶ</b><small>用途に合わせるだけ</small></div>
          <ArrowRight className="step-arrow" />
          <div><span>3</span><Printer /><b>印刷・投稿</b><small>PNGで保存して使う</small></div>
        </section>
      </main>
      <footer><Brand compact /><span>畑のそばで、ずっと使える道具を。</span></footer>
    </div>
  );
}

function ChooseScreen({
  category,
  onBack,
  onOpen,
  onCategory,
}: {
  category: CategoryId;
  onBack: () => void;
  onOpen: (id: OutputId) => void;
  onCategory: (id: CategoryId) => void;
}) {
  const current = categories.find((item) => item.id === category)!;
  return (
    <div className="choose-shell paper-bg">
      <header className="home-header">
        <button className="back-button" onClick={onBack}><ArrowLeft /> ホーム</button>
        <Brand compact />
        <button className="icon-button"><Menu /></button>
      </header>
      <main className="choose-main">
        <div className="choose-heading">
          <span className="eyebrow"><current.icon size={16} /> {current.title}のデザイン</span>
          <h1>作りたいものを<br />選んでください。</h1>
          <p>写真と文字を入れるだけで、農園らしいデザインに仕上がります。</p>
        </div>
        <nav className="category-tabs">
          {categories.map((item) => <button key={item.id} className={item.id === category ? "active" : ""} onClick={() => onCategory(item.id)}>{item.title}</button>)}
        </nav>
        <div className="output-grid">
          {current.outputs.map((id, index) => (
            <button className="output-card" key={id} onClick={() => onOpen(id)}>
              <DesignThumbnail output={id} />
              <span className="output-card-copy">
                <span className="output-index">0{index + 1}</span>
                <b>{outputs[id].title}</b>
                <small>{outputs[id].small}</small>
                <em>{outputs[id].size}</em>
              </span>
              <span className="circle-arrow"><ChevronRight /></span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function DesignThumbnail({ output }: { output: OutputId }) {
  if (output === "sticker") return <div className="design-thumb"><div className="thumb-sticker"><Sprout /><b>やさし畑</b><small>yasashi farm</small></div></div>;
  if (output === "story") return <div className="design-thumb"><div className="thumb-story"><Leaf /><b>今日の<br />とれたて</b><span>完熟トマト</span></div></div>;
  if (output === "letter") return <div className="design-thumb"><div className="thumb-letter"><b>畑だより</b><span /><span /><span /></div></div>;
  return <div className="design-thumb"><IllustratedVegetables /><span className="thumb-paper"><b>{outputs[output].title}</b><small>完熟トマト</small></span></div>;
}

function StudioHeader({ title, saved, onBack, onHome, onSave, onMobilePanel }: { title: string; saved: boolean; onBack: () => void; onHome: () => void; onSave: () => void; onMobilePanel: () => void }) {
  return (
    <header className="studio-header">
      <button className="back-button" onClick={onBack}><ArrowLeft /> <span>テンプレート</span></button>
      <button className="studio-brand" onClick={onHome}><Sprout /> 農家ポップ</button>
      <span className="studio-title">{title}</span>
      <div className="studio-actions">
        <button className="text-button muted"><RotateCcw size={16} /> やり直す</button>
        <button className="secondary-button" onClick={onMobilePanel}><Palette size={17} /> 編集する</button>
        <button className="primary-button small" onClick={onSave}>{saved ? <Check size={17} /> : <Download size={17} />}{saved ? "保存しました" : "PNGで保存"}</button>
      </div>
    </header>
  );
}

function EditorPanel({
  output,
  data,
  template,
  accent,
  onOutput,
  onUpdate,
  onUpload,
  onTemplate,
  onAccent,
  compact = false,
}: {
  output: OutputId;
  data: FormData;
  template: number;
  accent: string;
  onOutput: (id: OutputId) => void;
  onUpdate: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onTemplate: (index: number) => void;
  onAccent: (color: string) => void;
  compact?: boolean;
}) {
  return (
    <aside className={`editor-panel ${compact ? "compact-editor" : ""}`}>
      <div className="editor-section">
        <div className="editor-heading"><span>1</span><div><b>何を作りますか？</b><small>用途を切り替えられます</small></div></div>
        <select value={output} onChange={(e) => onOutput(e.target.value as OutputId)}>{Object.entries(outputs).map(([id, item]) => <option key={id} value={id}>{item.title}</option>)}</select>
      </div>
      <div className="editor-section">
        <div className="editor-heading"><span>2</span><div><b>写真と内容</b><small>入力するとすぐ反映されます</small></div></div>
        <label className="upload-box">
          {data.image ? <img src={data.image} alt="アップロードした野菜" /> : <><Upload /><b>野菜の写真を選ぶ</b><small>JPG・PNG / 10MBまで</small></>}
          <input type="file" accept="image/*" onChange={onUpload} />
        </label>
        {data.image && (
          <div className="crop-controls">
            <label><span>写真の左右位置</span><input type="range" min="0" max="100" value={data.cropX} onChange={(e) => onUpdate("cropX", Number(e.target.value))} /></label>
            <label><span>写真の上下位置</span><input type="range" min="0" max="100" value={data.cropY} onChange={(e) => onUpdate("cropY", Number(e.target.value))} /></label>
          </div>
        )}
        <Field label="野菜名" value={data.vegetable} onChange={(v) => onUpdate("vegetable", v)} />
        <div className="field-row">
          <Field label="価格（円）" value={data.price} onChange={(v) => onUpdate("price", v)} />
          <Field label="農園名" value={data.farm} onChange={(v) => onUpdate("farm", v)} />
        </div>
        <Field label="ひとこと説明" value={data.note} onChange={(v) => onUpdate("note", v)} area />
        {(output === "recipe") && <Field label="食べ方メモ" value={data.recipe} onChange={(v) => onUpdate("recipe", v)} area />}
        {(output === "list") && <Field label="今日出せる野菜（改行で追加）" value={data.items} onChange={(v) => onUpdate("items", v)} area />}
        {(output === "letter" || output === "instagram" || output === "story") && <Field label="今日のおすすめ文" value={data.recommendation} onChange={(v) => onUpdate("recommendation", v)} area />}
      </div>
      <div className="editor-section">
        <div className="editor-heading"><span>3</span><div><b>雰囲気を選ぶ</b><small>型と差し色だけで整います</small></div></div>
        <div className="template-options">
          {outputs[output].templates.map((name, index) => <button key={name} className={template === index ? "active" : ""} onClick={() => onTemplate(index)}><span className={`template-swatch swatch-${index}`} /><small>{name}</small></button>)}
        </div>
        <div className="color-row"><span>差し色</span>{palette.map((color) => <button key={color} style={{ background: color }} className={accent === color ? "active" : ""} onClick={() => onAccent(color)} aria-label={`色 ${color}`} />)}</div>
      </div>
    </aside>
  );
}

function Field({ label, value, onChange, area = false }: { label: string; value: string; onChange: (value: string) => void; area?: boolean }) {
  return <label className="field"><span>{label}</span>{area ? <textarea value={value} onChange={(e) => onChange(e.target.value)} /> : <input value={value} onChange={(e) => onChange(e.target.value)} />}</label>;
}

function PreviewArea({ output, data, template, accent, previewRef, onSave }: { output: OutputId; data: FormData; template: number; accent: string; previewRef: React.RefObject<HTMLDivElement | null>; onSave: () => void }) {
  return (
    <section className="preview-area">
      <div className="preview-toolbar"><span><Sparkles size={16} /> プレビュー</span><span className="size-pill">{outputs[output].size}</span><button onClick={onSave}><Save size={16} /> 保存</button></div>
      <div className="preview-stage">
        <div ref={previewRef} className={`artboard artboard-${output} artboard-template-${template}`} style={{ "--accent": accent } as React.CSSProperties}>
          <OutputDesign output={output} data={data} />
        </div>
      </div>
      <p className="preview-tip"><Leaf size={14} /> 文字や写真を変えると、ここにすぐ反映されます。</p>
    </section>
  );
}

function Photo({ data, className = "" }: { data: FormData; className?: string }) {
  return data.image ? <img className={`design-photo ${className}`} style={{ objectPosition: `${data.cropX}% ${data.cropY}%` }} src={data.image} alt="" /> : <div className={`design-photo placeholder-photo ${className}`}><IllustratedVegetables /><small>写真を入れると<br />ここに表示されます</small></div>;
}

function OutputDesign({ output, data }: { output: OutputId; data: FormData }) {
  if (output === "pop") return <div className="pop-design"><div className="design-copy"><span className="design-kicker">やさし畑の とれたて</span><h2>{data.vegetable}</h2><p>{data.note}</p><span className="season-label">今が旬！</span><strong>¥{data.price}<small>（税込）</small></strong><em>{data.farm}</em></div><Photo data={data} /><Botanical /></div>;
  if (output === "price") return <div className="price-design"><Botanical /><span>本日のとれたて</span><h2>{data.vegetable}</h2><strong>¥{data.price}<small>税込</small></strong><p>{data.farm}</p></div>;
  if (output === "recipe") return <div className="recipe-design"><div><span>おいしい食べ方</span><h2>{data.vegetable}の<br />かんたんレシピ</h2><Photo data={data} /></div><section><b>おすすめの食べ方</b><p>{data.recipe}</p><i>ひと手間で、畑のおいしさ。</i><em>{data.farm}</em></section><Botanical /></div>;
  if (output === "list") return <div className="list-design"><span>本日の</span><h2>とれたて野菜</h2><p className="date">{new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric", weekday: "short" }).format(new Date())}</p><ul>{data.items.split("\n").filter(Boolean).map((item) => <li key={item}><Leaf />{item}</li>)}</ul><em>{data.farm}</em><Botanical /></div>;
  if (output === "instagram") return <div className="instagram-design"><header><span className="avatar"><Sprout /></span><b>{data.account.replace("@", "") || data.farm}</b><span>•••</span></header><div className="insta-photo"><Photo data={data} /><h2>今日のお野菜</h2><span className="insta-tag">{data.vegetable}</span></div><footer><div>♡　◯　⌁</div><b>{data.farm}</b><p>{data.recommendation}</p><small>#とれたて野菜　#直売所　#旬の野菜</small></footer></div>;
  if (output === "story") return <div className="story-design"><Photo data={data} /><div className="story-overlay"><small>{data.farm}</small><h2>今日の<br />とれたて</h2><span>{data.vegetable}</span><p>{data.recommendation}</p></div><Botanical /></div>;
  if (output === "letter") return <div className="letter-design"><header><div><span>やさし畑から、季節のおたより</span><h2>畑だより</h2><small>{data.farm}</small></div><b>6月号</b></header><section><div><span>今月のおすすめ</span><h3>{data.vegetable}</h3><p>{data.note}</p></div><Photo data={data} /></section><section><div><span>畑のようす</span><h3>雨上がりの畑から</h3><p>{data.recommendation}</p></div><div className="field-illustration"><Sprout /><Sprout /><Sprout /></div></section><footer>今月もありがとうございます。畑でお待ちしています。</footer><Botanical /></div>;
  if (output === "profile") return <div className="profile-design"><span>はじめまして</span><h2>{data.farm}です</h2><Photo data={data} /><p>{data.note}</p><div><b>主な野菜</b><span>{data.items.split("\n").slice(0, 3).join("・")}</span></div><Botanical /></div>;
  if (output === "message") return <div className="message-design"><Botanical /><span>Thank you</span><h2>ありがとうございます</h2><p>おいしい時間になりますように。<br />また畑の野菜をお届けできますように。</p><b>{data.farm}</b></div>;
  return <div className="sticker-design"><div><Sprout /><span>畑から、まっすぐ。</span><h2>{data.farm}</h2><small>FRESH VEGETABLES</small></div></div>;
}

function Botanical() {
  return <div className="botanical" aria-hidden="true"><span>⌁</span><Leaf /><Leaf /><Sprout /></div>;
}

function IllustratedVegetables() {
  return <div className="vegetable-illustration" aria-hidden="true"><span className="veg tomato">●</span><span className="veg carrot">▲</span><span className="veg leaf">♠</span><span className="veg potato">●</span><span className="basket-line" /></div>;
}
