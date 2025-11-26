import React from 'react';
import { AnyCardData, CardType, WeaponData, ArmorData, DomainCardData, StoryCardData, ClassCardData, SubclassCardData, AncestryCardData, CommunityCardData } from '../types';

interface Props {
  data: AnyCardData;
  id?: string;
}

export const CardPreview: React.FC<Props> = ({ data, id }) => {
  // Common Header
  const Header = () => (
    <div className="border-b-2 border-canvas-accent/70 pb-2 mb-3 flex justify-between items-end relative z-10">
      <div className="flex-grow">
        <h2 className="text-[1.35rem] font-serif font-bold text-canvas-accent tracking-wide leading-none drop-shadow-md break-words pr-2">{data.name || "未命名"}</h2>
        <span className="text-[10px] text-canvas-muted font-sans uppercase tracking-widest opacity-80 mt-1 block">
          {data.type} 
        </span>
      </div>
      {/* Domain specific header info */}
      {(data.type === CardType.Domain) && (
        <div className="text-right shrink-0">
           <div className="text-[10px] text-canvas-muted">COST {(data as DomainCardData).recallCost}</div>
        </div>
      )}
    </div>
  );

  // Information Bar (Creator/Owner) - Moved from footer to top or subtle integrated line
  const MetaInfo = () => (
    <div className="flex justify-between w-full text-[9px] text-canvas-muted/50 font-sans uppercase tracking-wider mb-2 px-0.5">
      <span>{data.creator ? `BY ${data.creator}` : ""}</span>
      <span>{data.owner ? `FOR ${data.owner}` : ""}</span>
    </div>
  );

  // Specific Content Renders
  const renderContent = () => {
    switch (data.type) {
      case CardType.Weapon: {
        const w = data as WeaponData;
        return (
          <div className="space-y-3 font-serif text-sm h-full flex flex-col">
            <div className="grid grid-cols-2 gap-2 text-[11px] font-sans text-canvas-accent bg-canvas-900/50 p-2 rounded border border-canvas-700/30">
              <div><span className="text-canvas-muted">属性:</span> {w.trait}</div>
              <div><span className="text-canvas-muted">距离:</span> {w.range}</div>
              <div><span className="text-canvas-muted">伤害:</span> {w.damageDice} ({w.damageType})</div>
              <div><span className="text-canvas-muted">负荷:</span> {w.burden}</div>
            </div>
            <div className="border-l-2 border-canvas-accent pl-3 py-2 italic text-white bg-gradient-to-r from-canvas-accent/10 to-transparent rounded-r">
              {w.feature || "无特性"}
            </div>
            {w.description && <p className="text-canvas-muted text-xs leading-relaxed font-sans mt-auto pt-2 border-t border-canvas-800/50">{w.description}</p>}
          </div>
        );
      }
      case CardType.Armor: {
        const a = data as ArmorData;
        return (
          <div className="space-y-3 font-serif text-sm h-full flex flex-col">
             <div className="flex justify-between text-xs font-sans text-canvas-accent bg-canvas-900/50 p-2 rounded border border-canvas-700/30">
              <div className="text-center"><span className="block text-canvas-muted text-[10px]">护甲值</span> {a.score}</div>
              <div className="text-center"><span className="block text-canvas-muted text-[10px]">重度</span> {a.thresholdMajor}</div>
              <div className="text-center"><span className="block text-canvas-muted text-[10px]">严重</span> {a.thresholdSevere}</div>
            </div>
            <div className="border-l-2 border-canvas-accent pl-3 py-2 italic text-white bg-gradient-to-r from-canvas-accent/10 to-transparent rounded-r">
              {a.feature || "无特性"}
            </div>
            {a.description && <p className="text-canvas-muted text-xs leading-relaxed font-sans mt-auto pt-2 border-t border-canvas-800/50">{a.description}</p>}
          </div>
        );
      }
      case CardType.Domain: {
        const d = data as DomainCardData;
        return (
          <div className="space-y-3 font-serif text-sm h-full flex flex-col">
            <div className="text-xs font-sans text-canvas-accent mb-1 uppercase tracking-widest text-center border-b border-canvas-800 pb-1">{d.domainName} 领域</div>
            <div className="bg-canvas-900/30 p-3 rounded border border-canvas-700/30 text-white shadow-sm min-h-[80px]">
              {d.feature || "在此输入卡牌效果..."}
            </div>
            {d.description && <p className="text-canvas-muted text-xs leading-relaxed border-t border-canvas-800/50 pt-2 mt-auto">{d.description}</p>}
          </div>
        );
      }
      case CardType.Story: {
        const s = data as StoryCardData;
        return (
          <div className="space-y-4 font-serif text-sm h-full flex flex-col">
            <div className="bg-canvas-900/30 p-3 rounded border-l-4 border-canvas-accent">
              <span className="block text-[10px] text-canvas-accent font-sans mb-1 uppercase tracking-wider font-bold">触发条件</span>
              <div className="text-white text-xs">{s.trigger}</div>
            </div>
            <div className="bg-canvas-900/30 p-3 rounded border-l-4 border-canvas-danger">
              <span className="block text-[10px] text-canvas-danger font-sans mb-1 uppercase tracking-wider font-bold">效果/收益</span>
              <div className="text-white text-xs">{s.benefit}</div>
            </div>
            {s.description && <p className="text-canvas-muted text-xs italic text-center opacity-80 mt-auto pt-2">{s.description}</p>}
          </div>
        );
      }
      case CardType.Class: {
        const c = data as ClassCardData;
        return (
          <div className="space-y-3 font-serif text-sm h-full flex flex-col">
             <div className="grid grid-cols-2 gap-2 text-xs font-sans text-canvas-accent bg-canvas-900/50 p-2 rounded mb-2 border border-canvas-700/30">
              <div className="text-center"><span className="text-canvas-muted block text-[10px]">闪避</span> {c.evasion}</div>
              <div className="text-center"><span className="text-canvas-muted block text-[10px]">HP</span> {c.hp}</div>
            </div>
            <div className="bg-canvas-900/30 p-2 rounded border border-canvas-700/20">
              <span className="text-canvas-accent text-xs font-bold block mb-1 border-b border-canvas-800 pb-1">职业特性</span>
              <div className="text-white text-xs pl-1">{c.classFeature}</div>
            </div>
            <div className="bg-canvas-danger/5 p-2 rounded border border-canvas-danger/20">
              <span className="text-canvas-danger text-xs font-bold block mb-1 border-b border-canvas-danger/20 pb-1">希望特性 (3 Hope)</span>
              <div className="text-white text-xs pl-1">{c.hopeFeature}</div>
            </div>
             {c.description && <p className="text-canvas-muted text-[10px] pt-2 italic mt-auto">{c.description}</p>}
          </div>
        );
      }
      case CardType.Subclass: {
        const sc = data as SubclassCardData;
        return (
          <div className="space-y-3 font-serif text-sm h-full flex flex-col">
            <div className="text-center text-[10px] text-canvas-muted uppercase tracking-widest mb-2 border-b border-canvas-800 pb-1">{sc.className || "基础职业"} 专精</div>
            <div className="bg-canvas-900/30 p-2 rounded border-l-2 border-canvas-accent">
              <span className="text-canvas-accent text-xs font-bold block mb-1">基础特性</span>
              <div className="text-white text-xs pl-1">{sc.foundationFeature}</div>
            </div>
            <div className="bg-canvas-900/30 p-2 rounded border-l-2 border-canvas-accent">
              <span className="text-canvas-accent text-xs font-bold block mb-1">精通特性</span>
              <div className="text-white text-xs pl-1">{sc.masteryFeature}</div>
            </div>
            {sc.description && <p className="text-canvas-muted text-[10px] pt-2 italic mt-auto">{sc.description}</p>}
          </div>
        )
      }
      case CardType.Ancestry: {
        const anc = data as AncestryCardData;
        return (
          <div className="space-y-4 font-serif text-sm h-full flex flex-col">
            <p className="text-canvas-muted text-xs italic border-b border-canvas-800 pb-2 text-center">{anc.description}</p>
            <div className="space-y-4">
              <div>
                <span className="text-canvas-accent text-xs font-bold block mb-1">{anc.feature1Name || "特性 1"}</span>
                <div className="text-white text-xs pl-3 border-l-2 border-canvas-accent/50 bg-canvas-900/30 py-2 pr-2 rounded-r">{anc.feature1Desc}</div>
              </div>
              <div>
                <span className="text-canvas-danger text-xs font-bold block mb-1">{anc.feature2Name || "特性 2"}</span>
                <div className="text-white text-xs pl-3 border-l-2 border-canvas-danger/50 bg-canvas-900/30 py-2 pr-2 rounded-r">{anc.feature2Desc}</div>
              </div>
            </div>
          </div>
        );
      }
      case CardType.Community: {
        const com = data as CommunityCardData;
        return (
          <div className="space-y-4 font-serif text-sm h-full flex flex-col">
            <p className="text-canvas-muted text-xs italic border-b border-canvas-800 pb-2 text-center">{com.description}</p>
            <div className="bg-canvas-900/30 p-4 rounded border border-canvas-700/30 mt-4">
              <span className="text-canvas-accent text-xs font-bold block mb-2 text-center uppercase tracking-wider border-b border-canvas-800 pb-2">{com.featureName || "社群特性"}</span>
              <div className="text-white text-xs text-justify leading-relaxed">{com.featureDesc}</div>
            </div>
          </div>
        );
      }
      default: 
        return (
          <div className="space-y-3 font-serif text-sm h-full flex flex-col">
             <div className="bg-canvas-900/50 p-4 rounded border border-canvas-700/30 text-white min-h-[140px] shadow-sm flex items-center justify-center text-center italic leading-relaxed">
              {(data as any).feature || (data as any).benefit || data.description}
            </div>
            {(data as any).feature && <p className="text-canvas-muted text-xs leading-relaxed border-t border-canvas-800/50 pt-2 mt-auto">{data.description}</p>}
          </div>
        );
    }
  };

  return (
    <div 
      id={id}
      className="w-[300px] h-[420px] rounded-xl p-5 flex flex-col relative overflow-hidden shadow-2xl text-white font-antialiased border-4 border-canvas-800"
      style={{ 
        backgroundColor: '#18181b',
        // Subtle radial gradient for a premium look
        backgroundImage: 'radial-gradient(circle at top right, #27272a, #18181b 60%)',
      }}
    >
      {/* Inner Border */}
      <div className="absolute inset-1.5 border border-canvas-accent/30 rounded-lg pointer-events-none z-20"></div>

      {/* Header */}
      <Header />
      
      {/* Meta Info (Creator) */}
      <MetaInfo />

      {/* Content Content */}
      <div className="flex-grow overflow-y-auto z-10 relative scrollbar-thin scrollbar-thumb-canvas-700 scrollbar-track-transparent pr-1">
        {renderContent()}
      </div>
    </div>
  );
};