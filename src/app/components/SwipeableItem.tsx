'use client';
import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

interface SwipeableItemProps {
  id: string;
  name: string;
  isChecked: boolean;
  onToggleCheck: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export default function SwipeableItem({ id, name, isChecked, onToggleCheck, onDelete }: SwipeableItemProps) {

  // ****以下スワイプの計算はAIが生成****

  // スワイプの進行状況を数値(0〜100)で追跡
  const [swipeProgress, setSwipeProgress] = useState(0);

  // 設定値
  const maxSwipePixels = 150; // 最大スワイプ距離を増加（px）
  const deleteThreshold = 40;  // 削除アクションのトリガーしきい値（%）
  const resetDelay = 300;      // リセットの遅延時間（ms）

  // スワイプハンドラの設定
  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (e.deltaX < 0) { // 左方向へのスワイプのみ処理
        // 最大スワイプ距離を80pxとして、進行状況を計算（0〜100%）
        const progress = Math.min(100, Math.abs(e.deltaX) / maxSwipePixels * 100);
        setSwipeProgress(progress);
      } else {
        // 右スワイプの場合はリセット
        setSwipeProgress(0);
      }
    },
    onSwipedLeft: () => {
      // しきい値を超えたら削除アクションを実行
      if (swipeProgress >= deleteThreshold) {
        onDelete(id);
      } else {
        // しきい値未満ならリセット
        setSwipeProgress(0);
      }
    },
    onSwiped: () => {
      // スワイプ終了時にリセット（削除閾値に達していない場合）
      setTimeout(() => {
        setSwipeProgress(0);
      }, resetDelay);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  // 視覚的なフィードバック用の計算
  const translateX = (swipeProgress / 100) * maxSwipePixels;
  const deleteOpacity = Math.min(1, swipeProgress / (deleteThreshold * 0.8));
  const deleteScale = 0.8 + (swipeProgress / 100) * 0.4; // テキストがやや拡大（0.8〜1.2）
  const deleteBackgroundColor = `rgba(239, 68, 68, ${deleteOpacity})`;


  return (
    <div className="relative overflow-hidden rounded-sm">
      {/* 削除エリア（背景） - 進行状況に応じて色が変化 */}
      <div 
        className="absolute inset-y-0 right-0 flex items-center justify-end text-white w-full transition-colors duration-200"
        style={{ backgroundColor: deleteBackgroundColor }}
      >
        <div className="px-4 font-medium" style={{ opacity: deleteOpacity }}>削除</div>
      </div>
      
      {/* 前面コンテンツ - より大きな移動距離 */}
      <div 
        {...handlers}
        className="flex bg-white w-full items-center transition-transform duration-200"
        style={{ 
          transform: `translateX(-${translateX}px)`,
        }}
      >
        <input 
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggleCheck(id, isChecked)}
          className="w-5 ml-3 my-auto"
          aria-label={`${name}のステータスを切り替え`}
        />
        <div className="p-3 pr-10 w-full">
          <h1 className={`text-lg font-semibold ${isChecked ? 'line-through text-gray-400' : 'text-black'}`}>
            {name}
          </h1>
        </div>
      </div>
    </div>
  );
}