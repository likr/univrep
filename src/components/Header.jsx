import { useState } from "react";

export default function Header() {
  const [showDetail, setShowDetail] = useState(false);
  return (
    <header onClick={() => {}}>
      <div className="title">
        <h1>大学 Bad News ビジュアライゼーション</h1>
        <button
          onClick={() => {
            setShowDetail(true);
          }}
        >
          ?
        </button>
      </div>
      <div className={`description${showDetail ? "" : " hidden"}`}>
        <p>
          本Webサイトは、大学に関するニュース記事タイトルに感情分析を適用し、「ネガティブ」と判断された記事の数を可視化したものです。
        </p>
        <p>
          ニュース記事タイトルはGoogle Newsから取得しました。
          対象期間は2017年1月1日～2021年12月31日、対象大学は以下の20大学です。
        </p>
        <p className="universities">
          早稲田大学 慶應大学
          <br className="show-mobile" />
          上智大学 国際基督教大学 学習院大学
          <br />
          明治大学 立教大学 青山学院大学
          <br className="show-mobile" /> 中央大学 法政大学
          <br />
          成蹊大学 明治学院大学 成城大学
          <br className="show-mobile" /> 武蔵大学 國學院大學 獨協大学
          <br />
          東洋大学 日本大学 専修大学 駒澤大学
        </p>
        <p>
          制作：
          <a
            href="https://vdslab.jp/"
            target="_blank"
            rel="noopener noreferrer"
          >
            日本大学文理学部情報科学科 尾上研究室
          </a>
        </p>
        <div>
          <button
            onClick={() => {
              setShowDetail(false);
            }}
          >
            close
          </button>
        </div>
      </div>
    </header>
  );
}
