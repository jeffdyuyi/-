import React, { useState, useEffect } from 'react';
import { CardPreview } from './components/CardPreview';
import { CardType, AnyCardData, WeaponData, ArmorData, DomainCardData, StoryCardData, ClassCardData, SubclassCardData, AncestryCardData, CommunityCardData, Trait, Range, DamageType, Burden, SavedCard } from './types';
import { CARD_TYPES, TRAITS, RANGES, DAMAGE_TYPES, BURDENS, DEFAULT_WEAPON, WATERMARK } from './constants';
import { downloadCardImage, copyCode, loadCode, saveCardToLibrary, loadLibrary, removeCardFromLibrary, generateId } from './utils';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CardType | null>(null);
  const [cardData, setCardData] = useState<AnyCardData>(DEFAULT_WEAPON);
  const [importString, setImportString] = useState("");
  const [isSingleToolMode, setIsSingleToolMode] = useState(false);
  
  // Library State
  const [library, setLibrary] = useState<SavedCard[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Initialize based on URL params and load library
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toolParam = params.get('tool');
    
    if (toolParam && Object.values(CardType).includes(toolParam as CardType)) {
      handleTabChange(toolParam as CardType);
      setIsSingleToolMode(true);
    }

    setLibrary(loadLibrary());
  }, []);

  const handleTabChange = (type: CardType) => {
    setActiveTab(type);
    setEditingId(null); // Reset editing state when switching tools manually
    
    // Update URL without reloading if not already in that mode
    const url = new URL(window.location.href);
    url.searchParams.set('tool', type);
    window.history.pushState({}, '', url);

    const base = {
      type: type,
      name: "",
      description: "",
      creator: "",
      owner: "",
    };

    // Reset data to defaults for the type
    switch (type) {
      case CardType.Weapon:
        setCardData({ ...base, trait: Trait.Agility, range: Range.Melee, damageDice: "d8", damageType: DamageType.Physical, burden: Burden.OneHand, feature: "" } as WeaponData);
        break;
      case CardType.Armor:
        setCardData({ ...base, score: 0, thresholdMajor: 5, thresholdSevere: 10, feature: "" } as ArmorData);
        break;
      case CardType.Domain:
        setCardData({ ...base, domainName: "", level: 1, recallCost: 1, feature: "" } as DomainCardData);
        break;
      case CardType.Story:
        setCardData({ ...base, trigger: "", benefit: "" } as StoryCardData);
        break;
      case CardType.Class:
        setCardData({ ...base, evasion: 10, hp: 6, classFeature: "", hopeFeature: "" } as ClassCardData);
        break;
      case CardType.Subclass:
        setCardData({ ...base, className: "", foundationFeature: "", masteryFeature: "" } as SubclassCardData);
        break;
      case CardType.Ancestry:
        setCardData({ ...base, feature1Name: "", feature1Desc: "", feature2Name: "", feature2Desc: "" } as AncestryCardData);
        break;
      case CardType.Community:
        setCardData({ ...base, featureName: "", featureDesc: "" } as CommunityCardData);
        break;
      default: 
        setCardData({ ...base, feature: "" } as any);
        break;
    }
  };

  const goBackToPortal = () => {
    setActiveTab(null);
    setIsSingleToolMode(false);
    setEditingId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('tool');
    window.history.pushState({}, '', url);
    setLibrary(loadLibrary()); // Reload library to be sure
  };

  const shareTool = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert(`工具链接已复制！\n发送给朋友，他们打开后将直接进入【${activeTab}制作】页面。`);
    });
  };

  const updateField = (field: string, value: any) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  // --- Library Actions ---

  const handleSave = () => {
    if (!cardData.name) {
      alert("请先输入卡牌名称");
      return;
    }
    const id = editingId || generateId();
    const newCard: SavedCard = {
      id,
      updatedAt: Date.now(),
      data: cardData
    };
    const updatedLib = saveCardToLibrary(newCard);
    setLibrary(updatedLib);
    setEditingId(id);
    alert("保存成功！");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("确定要删除这张卡牌吗？")) {
      const updatedLib = removeCardFromLibrary(id);
      setLibrary(updatedLib);
    }
  };

  const handleEdit = (card: SavedCard) => {
    setCardData(card.data);
    setEditingId(card.id);
    setActiveTab(card.data.type);
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('tool', card.data.type);
    window.history.pushState({}, '', url);
  };

  const handleCopy = (e: React.MouseEvent, card: SavedCard) => {
    e.stopPropagation();
    const newId = generateId();
    const newCard: SavedCard = {
      ...card,
      id: newId,
      updatedAt: Date.now(),
      data: { ...card.data, name: `${card.data.name} (副本)` }
    };
    const updatedLib = saveCardToLibrary(newCard);
    setLibrary(updatedLib);
  };

  const handleImport = () => {
    const loaded = loadCode(importString);
    if (loaded) {
      setCardData(loaded);
      setEditingId(null); // Importing creates a new unsaved state usually
      setActiveTab(loaded.type);
    }
  };

  // --- Render Helpers for Input Forms ---
  const renderCommonInputs = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label className="block text-xs text-canvas-accent mb-1 font-medium">名称</label>
          <input 
            type="text" 
            value={cardData.name} 
            onChange={e => updateField('name', e.target.value)}
            className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded focus:border-canvas-accent focus:ring-1 focus:ring-canvas-accent outline-none transition-all"
            placeholder="输入卡牌名称..."
          />
        </div>
        
        <div>
          <label className="block text-xs text-canvas-accent mb-1 font-medium">创作者</label>
          <input 
            type="text" 
            value={cardData.creator} 
            onChange={e => updateField('creator', e.target.value)}
            className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded focus:border-canvas-accent outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-canvas-accent mb-1 font-medium">所属角色</label>
          <input 
            type="text" 
            value={cardData.owner} 
            onChange={e => updateField('owner', e.target.value)}
            className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded focus:border-canvas-accent outline-none"
          />
        </div>
      </div>
      {activeTab !== CardType.Subclass && (
        <div>
          <label className="block text-xs text-canvas-accent mb-1 font-medium">描述/风味文字</label>
          <textarea 
            value={cardData.description} 
            onChange={e => updateField('description', e.target.value)}
            className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded focus:border-canvas-accent outline-none h-20 text-sm resize-none"
            placeholder="关于这张卡牌的描述或背景故事..."
          />
        </div>
      )}
    </>
  );

  const renderSpecificInputs = () => {
    switch (activeTab) {
      case CardType.Weapon:
        const w = cardData as WeaponData;
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">属性</label>
              <select value={w.trait} onChange={e => updateField('trait', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded">
                {TRAITS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">距离</label>
              <select value={w.range} onChange={e => updateField('range', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded">
                {RANGES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">伤害骰 (如 d8+1)</label>
              <input type="text" value={w.damageDice} onChange={e => updateField('damageDice', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded" />
            </div>
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">伤害类型</label>
              <select value={w.damageType} onChange={e => updateField('damageType', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded">
                {DAMAGE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-canvas-accent mb-1 font-medium">负荷</label>
              <select value={w.burden} onChange={e => updateField('burden', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded">
                {BURDENS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-canvas-accent mb-1 font-medium">特性效果</label>
              <textarea value={w.feature} onChange={e => updateField('feature', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-24 resize-none" />
            </div>
          </div>
        );
      case CardType.Armor:
        const a = cardData as ArmorData;
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">护甲值</label>
              <input type="number" value={a.score} onChange={e => updateField('score', parseInt(e.target.value))} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded" />
            </div>
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">重度阈值</label>
              <input type="number" value={a.thresholdMajor} onChange={e => updateField('thresholdMajor', parseInt(e.target.value))} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded" />
            </div>
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">严重阈值</label>
              <input type="number" value={a.thresholdSevere} onChange={e => updateField('thresholdSevere', parseInt(e.target.value))} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded" />
            </div>
            <div className="col-span-3">
              <label className="block text-xs text-canvas-accent mb-1 font-medium">护甲特性</label>
              <textarea value={a.feature} onChange={e => updateField('feature', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-24 resize-none" />
            </div>
          </div>
        );
      case CardType.Domain:
        const d = cardData as DomainCardData;
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">领域名称 (如 骸骨)</label>
              <input type="text" value={d.domainName} onChange={e => updateField('domainName', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded" />
            </div>
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">回想费用 (Recall Cost)</label>
              <input type="number" value={d.recallCost} onChange={e => updateField('recallCost', parseInt(e.target.value))} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-canvas-accent mb-1 font-medium">卡牌能力/法术</label>
              <textarea value={d.feature} onChange={e => updateField('feature', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-32 resize-none" />
            </div>
          </div>
        );
      case CardType.Story:
        const s = cardData as StoryCardData;
        return (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">触发条件 (当你...)</label>
              <textarea value={s.trigger} onChange={e => updateField('trigger', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-20 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">效果/收益</label>
              <textarea value={s.benefit} onChange={e => updateField('benefit', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-20 resize-none" />
            </div>
          </div>
        );
      case CardType.Class:
        const c = cardData as ClassCardData;
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">基础闪避</label>
              <input type="number" value={c.evasion} onChange={e => updateField('evasion', parseInt(e.target.value))} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded" />
            </div>
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">基础HP</label>
              <input type="number" value={c.hp} onChange={e => updateField('hp', parseInt(e.target.value))} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-canvas-accent mb-1 font-medium">职业特性</label>
              <textarea value={c.classFeature} onChange={e => updateField('classFeature', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-24 resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-canvas-danger mb-1 font-medium">希望特性 (消耗3点希望)</label>
              <textarea value={c.hopeFeature} onChange={e => updateField('hopeFeature', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-24 resize-none" />
            </div>
          </div>
        );
      case CardType.Subclass:
        const sc = cardData as SubclassCardData;
        return (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">基础职业 (如 战士)</label>
              <input type="text" value={sc.className} onChange={e => updateField('className', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded" />
            </div>
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">基础特性</label>
              <textarea value={sc.foundationFeature} onChange={e => updateField('foundationFeature', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-24 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">精通特性</label>
              <textarea value={sc.masteryFeature} onChange={e => updateField('masteryFeature', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-24 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">描述/风味文字</label>
              <textarea 
                value={sc.description} 
                onChange={e => updateField('description', e.target.value)}
                className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-20 text-sm resize-none"
                placeholder="关于这个子职业的描述..."
              />
            </div>
          </div>
        );
      case CardType.Ancestry:
        const anc = cardData as AncestryCardData;
        return (
          <div className="grid grid-cols-1 gap-4">
            <div className="border-l-2 border-canvas-accent pl-3">
              <label className="block text-xs text-canvas-accent mb-1 font-medium">特性 1 名称</label>
              <input type="text" value={anc.feature1Name} onChange={e => updateField('feature1Name', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded mb-2" />
              <label className="block text-xs text-canvas-muted mb-1">特性 1 描述</label>
              <textarea value={anc.feature1Desc} onChange={e => updateField('feature1Desc', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-20 resize-none" />
            </div>
            <div className="border-l-2 border-canvas-danger pl-3">
              <label className="block text-xs text-canvas-danger mb-1 font-medium">特性 2 名称</label>
              <input type="text" value={anc.feature2Name} onChange={e => updateField('feature2Name', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded mb-2" />
              <label className="block text-xs text-canvas-muted mb-1">特性 2 描述</label>
              <textarea value={anc.feature2Desc} onChange={e => updateField('feature2Desc', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-20 resize-none" />
            </div>
          </div>
        );
      case CardType.Community:
        const com = cardData as CommunityCardData;
        return (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">社群特性名称</label>
              <input type="text" value={com.featureName} onChange={e => updateField('featureName', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded mb-2" />
              <label className="block text-xs text-canvas-muted mb-1">社群特性描述</label>
              <textarea value={com.featureDesc} onChange={e => updateField('featureDesc', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-32 resize-none" />
            </div>
          </div>
        );
      default: // Loot, Consumables
        return (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-canvas-accent mb-1 font-medium">效果描述 / 特性</label>
              <textarea value={(cardData as any).feature || ""} onChange={e => updateField('feature', e.target.value)} className="w-full bg-canvas-900 border border-canvas-700 text-canvas-text p-2.5 rounded h-32 resize-none" />
            </div>
          </div>
        );
    }
  }

  // --- Tool Portal View ---
  if (!activeTab) {
    return (
      <div className="min-h-screen bg-canvas-950 text-canvas-text p-8 font-sans flex flex-col items-center justify-center selection:bg-canvas-accent selection:text-canvas-900">
        <header className="mb-12 text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-canvas-accent tracking-widest drop-shadow-lg">匕首之心</h1>
          <h2 className="text-xl md:text-2xl text-canvas-muted tracking-[0.5em] uppercase">卡牌工坊</h2>
          <p className="text-xs text-canvas-600 pt-4 max-w-lg mx-auto">
            选择一个生成器模块启动。生成的卡牌可以保存到本地库，便于二次编辑。
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl w-full mb-16">
          {CARD_TYPES.map(type => (
            <button 
              key={type}
              onClick={() => handleTabChange(type)}
              className="group relative h-32 bg-canvas-900 border border-canvas-800 rounded-xl hover:border-canvas-accent hover:bg-canvas-800 transition-all duration-300 flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-canvas-accent/10 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50 pointer-events-none"></div>
              <span className="font-serif text-lg font-bold text-canvas-text group-hover:text-canvas-accent relative z-10">{type}</span>
              <span className="text-[10px] text-canvas-muted uppercase tracking-widest relative z-10 group-hover:text-canvas-text">生成器</span>
            </button>
          ))}
        </div>

        {/* Local Library Section */}
        <div className="w-full max-w-5xl">
          <div className="border-b border-canvas-800 pb-4 mb-6 flex justify-between items-end">
            <h3 className="text-xl font-serif text-canvas-accent font-bold">本地卡牌库 (Local Library)</h3>
            <span className="text-xs text-canvas-600">共 {library.length} 张卡牌</span>
          </div>
          
          {library.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-canvas-800 rounded-xl text-canvas-600">
              暂无保存的卡牌。在生成器中点击“保存到库”即可添加。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {library.map(card => (
                <div key={card.id} className="bg-canvas-900/80 border border-canvas-800 p-4 rounded-lg flex flex-col gap-2 hover:border-canvas-600 transition-colors group relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-serif text-lg text-canvas-text font-bold">{card.data.name || "未命名"}</div>
                      <div className="text-[10px] text-canvas-accent uppercase tracking-wider">{card.data.type}</div>
                    </div>
                    <div className="text-[10px] text-canvas-600">
                      {new Date(card.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-auto pt-3 flex gap-2 border-t border-canvas-800/50">
                    <button 
                      onClick={() => handleEdit(card)}
                      className="flex-1 py-1.5 bg-canvas-800 hover:bg-canvas-700 text-[10px] rounded text-center transition-colors text-canvas-muted hover:text-white"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={(e) => handleCopy(e, card)}
                      className="px-3 py-1.5 bg-canvas-800 border border-canvas-700 hover:border-canvas-500 text-[10px] rounded text-center transition-colors text-canvas-muted hover:text-white"
                      title="复制副本"
                    >
                      复制
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, card.id)}
                      className="px-3 py-1.5 bg-canvas-danger/10 hover:bg-canvas-danger/20 text-canvas-danger border border-transparent hover:border-canvas-danger/30 text-[10px] rounded text-center transition-colors"
                      title="删除"
                    >
                      删
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-16 text-center text-canvas-600 text-xs pb-8">
          <p className="font-bold text-canvas-muted">{WATERMARK.author} | QQ: {WATERMARK.qq} | WX: {WATERMARK.wx}</p>
          <p className="mt-1">{WATERMARK.msg}</p>
        </footer>
      </div>
    );
  }

  // --- Single Tool View ---
  return (
    <div className="min-h-screen bg-canvas-950 text-canvas-text p-4 md:p-8 font-sans flex flex-col items-center selection:bg-canvas-accent selection:text-canvas-900">
      <header className="w-full max-w-6xl flex justify-between items-center mb-8 border-b border-canvas-800 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={goBackToPortal} className="text-canvas-muted hover:text-canvas-accent transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs hidden sm:inline">返回库</span>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-canvas-accent tracking-wide flex items-center gap-2">
              {activeTab}制作
              {editingId && <span className="text-xs bg-canvas-accent text-canvas-900 px-2 py-0.5 rounded">编辑模式</span>}
            </h1>
            <p className="text-[10px] text-canvas-600 tracking-wider">DAGGERHEART ARCHITECT</p>
          </div>
        </div>
        <button 
          onClick={shareTool}
          className="px-3 py-1.5 border border-canvas-700 rounded text-xs text-canvas-muted hover:border-canvas-accent hover:text-canvas-accent transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          分享
        </button>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Editor */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-canvas-900 border border-canvas-800 p-6 rounded-xl shadow-lg space-y-4 relative overflow-hidden">
            {renderCommonInputs()}
            {renderSpecificInputs()}
          </div>

          {/* Action Bar */}
          <div className="flex gap-4">
             <button 
                onClick={handleSave} 
                className="flex-1 px-4 py-3 bg-canvas-accent text-canvas-900 font-bold text-sm rounded-lg shadow-lg hover:bg-[#fbbf24] hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {editingId ? "更新卡牌" : "保存到库"}
              </button>
          </div>

          {/* Import/Export */}
          <div className="bg-canvas-900 border border-canvas-800 p-4 rounded-xl">
            <div className="text-xs text-canvas-muted mb-2">外部代码导入</div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="在此粘贴卡牌代码..." 
                value={importString}
                onChange={e => setImportString(e.target.value)}
                className="flex-grow bg-canvas-950 border border-canvas-700 text-canvas-text text-xs p-2 rounded outline-none focus:border-canvas-600 placeholder:text-canvas-700"
              />
              <button onClick={handleImport} className="px-4 py-2 bg-canvas-800 text-canvas-text text-xs rounded hover:bg-canvas-700 transition-colors">
                读取
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="lg:col-span-5 flex flex-col items-center gap-6 sticky top-8">
          <div className="relative group">
            <CardPreview data={cardData} id="card-preview-element" />
            <div className="absolute -bottom-8 w-full text-center text-xs text-canvas-600 animate-pulse hidden group-hover:block">
              预览模式
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center w-full">
            <button 
              onClick={() => downloadCardImage('card-preview-element', cardData.name || 'card')}
              className="px-6 py-2 bg-canvas-800 border border-canvas-700 text-canvas-text text-sm rounded hover:bg-canvas-700 transition-all"
            >
              下载图片 (PNG)
            </button>
            <button 
              onClick={() => copyCode(cardData)}
              className="px-6 py-2 border border-canvas-accent text-canvas-accent text-sm rounded hover:bg-canvas-900 transition-colors"
            >
              复制JSON代码
            </button>
          </div>
          
          <p className="text-xs text-canvas-600 text-center max-w-xs">
            提示: 保存到库后，即使关闭浏览器，卡牌数据也会保留在您的电脑中。
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;