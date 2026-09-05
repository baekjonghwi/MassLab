"use client";
import { useEffect, useRef, useState } from "react";

// ==========================================================================
//  담긴 상자의 실제 너비(px)를 재 준다. 차트들이 함께 쓴다.
//
//  🔴viewBox 로 늘려 그리지 않는 이유 — SVG 를 통째로 확대하면 **글자와 선까지**
//    같이 늘어난다. 좁은 화면에서는 축 글씨가 뭉개지고 넓은 화면에서는 선이
//    굵어진다. 그래서 너비를 재서 좌표를 다시 계산한다. 글자는 언제나 10px 다.
//
//  ⚠️첫 그림에서는 0 이다(아직 안 붙었다). 부르는 쪽은 w<=0 이면 아무것도
//    안 그린다 — 0 으로 나누는 자리가 여럿 있다.
// ==========================================================================
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    setW(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  return [ref, w] as const;
}
