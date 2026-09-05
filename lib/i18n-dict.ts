import type { Lang } from "./i18n";

// ==========================================================================
//  화면 문구의 나머지 여섯 언어 — 열쇠는 **영어 원문**이다(2026-09-03).
//
//  🔴화면 파일에는 지금도 한국어·영어만 적는다. 여기 없는 문장은 조용히 영어로
//    남는다(빈칸은 절대 안 난다). 그래서 문구를 새로 넣어도 화면은 안 깨진다.
//    ⚠️영어 원문을 한 글자라도 고치면 열쇠가 바뀐 것이다 — 여기 열쇠도 함께
//      고칠 것. 안 고치면 그 줄만 영어로 되돌아간다.
//
//  🔴순서는 [ja, zh, es, pt, fr, de] 한 벌로 고정이다. 언어를 더할 자리는
//    lib/i18n.ts 의 LANGS 이고, 여기 줄마다 칸을 하나씩 늘려야 한다.
//    ⛔칸을 빠뜨리면 타입이 잡는다(길이 6 의 튜플).
//
//  ⛔약관·개인정보처리방침(lib/translations 의 terms·privacy)은 여기 없다.
//    PG 가맹점 심사에 낸 문서라 번역본이 원문 행세를 하면 안 된다 — 그 두 글은
//    어느 언어에서도 영어 원문 그대로 선다.
//
//  🔴사람 이름·주소·상품명(archiMap · LaserFish · PayPal · Rhino)은 옮기지 않는다.
//    archiMap 의 '나라·도시 이름은 번역하지 않는다' 규칙과 같은 결이다.
// ==========================================================================

const ORDER = ["ja", "zh", "es", "pt", "fr", "de"] as const;
type Six = readonly [string, string, string, string, string, string];

// prettier-ignore
const M: Record<string, Six> = {
  // ── 메뉴·공통 ──────────────────────────────────────────────────────────
  "Download": ["ダウンロード", "下载", "Descargar", "Descarregar", "Télécharger", "Herunterladen"],
  "How to Use": ["使い方", "使用方法", "Cómo usar", "Como usar", "Guia de utilização", "Anleitung"],
  "How to use": ["使い方", "使用方法", "Cómo usar", "Como usar", "Guia de utilização", "Anleitung"],
  "Pricing": ["料金", "价格", "Precios", "Preços", "Tarifs", "Preise"],
  "Contact": ["お問い合わせ", "联系我们", "Contacto", "Contacto", "Contact", "Kontakt"],
  "Contact Us": ["お問い合わせ", "联系我们", "Contacto", "Contacto", "Nous contacter", "Kontakt"],
  "Products": ["製品", "产品", "Productos", "Produtos", "Produits", "Produkte"],
  "Tools": ["ツール", "工具", "Herramientas", "Ferramentas", "Outils", "Werkzeuge"],
  "Top": ["トップ", "顶部", "Inicio", "Início", "Haut", "Anfang"],
  "Output": ["制作物", "成果", "Resultados", "Resultados", "Réalisations", "Ergebnisse"],
  "Capabilities": ["できること", "功能", "Capacidades", "Capacidades", "Capacités", "Funktionen"],
  "Sections": ["セクション移動", "板块导航", "Secciones", "Secções", "Sections", "Abschnitte"],
  "Legal": ["規約", "条款", "Legal", "Legal", "Mentions légales", "Rechtliches"],
  "Follow": ["チャンネル", "关注我们", "Síguenos", "Siga-nos", "Nous suivre", "Kanäle"],
  "Email": ["メール", "邮箱", "Correo", "E-mail", "E-mail", "E-Mail"],
  "Close": ["閉じる", "关闭", "Cerrar", "Fechar", "Fermer", "Schließen"],
  "Loading…": ["読み込み中…", "加载中…", "Cargando…", "A carregar…", "Chargement…", "Wird geladen…"],
  "Loading...": ["読み込み中…", "加载中…", "Cargando…", "A carregar…", "Chargement…", "Wird geladen…"],
  "Working…": ["処理中…", "处理中…", "Procesando…", "A processar…", "Traitement…", "Wird ausgeführt…"],
  "Checking…": ["確認中…", "确认中…", "Comprobando…", "A verificar…", "Vérification…", "Wird geprüft…"],
  "Processing…": ["処理中…", "处理中…", "Procesando…", "A processar…", "Traitement…", "Wird verarbeitet…"],
  "Processing...": ["処理中…", "处理中…", "Procesando…", "A processar…", "Traitement…", "Wird verarbeitet…"],
  "Something went wrong.": ["処理に失敗しました。", "操作失败。", "Algo salió mal.", "Algo correu mal.", "Une erreur s'est produite.", "Etwas ist schiefgelaufen."],
  "Something went wrong. Please try again.": ["処理に失敗しました。もう一度お試しください。", "操作失败，请重试。", "Algo salió mal. Inténtalo de nuevo.", "Algo correu mal. Tente novamente.", "Une erreur s'est produite. Veuillez réessayer.", "Etwas ist schiefgelaufen. Bitte erneut versuchen."],
  "← Back": ["← 戻る", "← 返回", "← Volver", "← Voltar", "← Retour", "← Zurück"],
  "← Back to home": ["← ホームへ", "← 返回首页", "← Volver al inicio", "← Voltar ao início", "← Retour à l'accueil", "← Zurück zur Startseite"],
  "Go Home": ["ホームへ", "返回首页", "Ir al inicio", "Ir para o início", "Aller à l'accueil", "Zur Startseite"],
  "Skip": ["スキップ", "跳过", "Omitir", "Ignorar", "Passer", "Überspringen"],
  "Terms": ["利用規約", "服务条款", "Términos", "Termos", "Conditions", "AGB"],
  "Privacy": ["プライバシー", "隐私", "Privacidad", "Privacidade", "Confidentialité", "Datenschutz"],
  "Terms and Policy": ["利用規約・返金ポリシー", "服务条款与退款政策", "Términos y política de reembolso", "Termos e política de reembolso", "Conditions et politique de remboursement", "AGB und Rückerstattungsrichtlinie"],
  "Terms of Service": ["利用規約", "服务条款", "Términos del servicio", "Termos de serviço", "Conditions d'utilisation", "Nutzungsbedingungen"],

  // ── 홈(랜딩) ───────────────────────────────────────────────────────────
  "My account": ["マイページ", "我的账户", "Mi cuenta", "A minha conta", "Mon compte", "Mein Konto"],
  "Login": ["ログイン", "登录", "Iniciar sesión", "Iniciar sessão", "Connexion", "Anmelden"],
  "Every architecture project,\n*in one place.*": ["建築プロジェクトを\n*ひとつの場所で。*", "每一个建筑项目，\n*都在一处。*", "Cada proyecto de arquitectura,\n*en un solo lugar.*", "Todos os projetos de arquitetura,\n*num só lugar.*", "Tous vos projets d'architecture,\n*au même endroit.*", "Jedes Architekturprojekt,\n*an einem Ort.*"],
  "Site analysis, model making, color palettes — a suite for architects, under one account.": ["敷地分析、模型製作、配色 — 建築家のための道具をひとつのアカウントにまとめました。", "场地分析、模型制作、配色方案 —— 为建筑师准备的工具，一个账户全都有。", "Análisis del sitio, maquetas y paletas de color: un conjunto de herramientas para arquitectos, en una sola cuenta.", "Análise do terreno, maquetas e paletas de cor: um conjunto de ferramentas para arquitetos, numa só conta.", "Analyse de site, maquettes, palettes de couleurs — une suite pour architectes, sous un seul compte.", "Standortanalyse, Modellbau, Farbpaletten — Werkzeuge für Architekten, unter einem Konto."],
  "Start project": ["プロジェクトを始める", "开始项目", "Empezar proyecto", "Começar projeto", "Démarrer un projet", "Projekt starten"],
  "Watch video": ["動画を見る", "观看视频", "Ver vídeo", "Ver vídeo", "Voir la vidéo", "Video ansehen"],
  "Read the site\nin one click.": ["敷地を\nひと目で読む。", "一键读懂\n场地。", "Lee el sitio\nde un clic.", "Leia o terreno\ncom um clique.", "Lisez le site\nen un clic.", "Den Standort\nauf einen Klick lesen."],
  "Drop a pin anywhere on Earth. archiMap pulls live urban data and renders analysis diagrams — zoning, green, traffic noise, solar — then hands you a 3D site model.": ["地球上のどこでもピンを一本。archiMap が都市データを読み込み、用途地域・緑地・交通騒音・日照の分析図を描き、3D 敷地モデルまで作ります。", "在地球上任意位置放下一个标记点。archiMap 会调取实时城市数据，绘制用地分区、绿地、交通噪声、日照分析图，并生成 3D 场地模型。", "Coloca un pin en cualquier punto del planeta. archiMap trae datos urbanos en vivo y dibuja diagramas de análisis —usos, zonas verdes, ruido de tráfico, soleamiento— y te entrega un modelo 3D del sitio.", "Coloque um pin em qualquer ponto do planeta. O archiMap traz dados urbanos em tempo real e desenha diagramas de análise — usos, zonas verdes, ruído de tráfego, insolação — e entrega-lhe um modelo 3D do terreno.", "Placez un point n'importe où sur Terre. archiMap récupère les données urbaines et dessine les diagrammes d'analyse — zonage, espaces verts, bruit routier, ensoleillement — puis vous remet un modèle 3D du site.", "Setzen Sie irgendwo auf der Erde eine Markierung. archiMap lädt aktuelle Stadtdaten, zeichnet Analysediagramme — Nutzung, Grünflächen, Verkehrslärm, Besonnung — und liefert ein 3D-Geländemodell."],
  "Colors that\nhold together.": ["ばらばらにならない\n配色。", "彼此协调的\n配色。", "Colores que\nfuncionan juntos.", "Cores que\nfuncionam juntas.", "Des couleurs qui\ntiennent ensemble.", "Farben, die\nzusammenpassen."],
  "Build palettes for drawings and boards, check them against each other, and carry the exact values into your renders.": ["図面やパネルに使う色を選び、互いの相性を確かめ、その値のままレンダリングへ持っていけます。", "为图纸和展板挑选颜色，检查彼此是否协调，并把精确的色值带入渲染。", "Crea paletas para planos y paneles, compruébalas entre sí y lleva los valores exactos a tus renders.", "Crie paletas para desenhos e painéis, verifique-as em conjunto e leve os valores exatos para os seus renders.", "Composez des palettes pour vos plans et panneaux, vérifiez-les entre elles, puis reportez les valeurs exactes dans vos rendus.", "Erstellen Sie Paletten für Pläne und Tafeln, prüfen Sie sie gegeneinander und übernehmen Sie die exakten Werte in Ihre Renderings."],
  "Laser-cut drawings,\nfrom one plug-in.": ["レーザーカット図面を\nプラグインひとつで。", "激光切割图纸，\n一个插件搞定。", "Planos para corte láser,\ndesde un plug-in.", "Desenhos para corte a laser,\na partir de um plug-in.", "Des plans pour découpe laser,\ndepuis un seul plug-in.", "Laserschnitt-Zeichnungen\naus einem Plug-in."],
  "A Rhino plug-in that unfolds walls, slabs and terrain into cut-ready drawings. Walls of differing thickness and curved walls are no trouble at all.": ["壁・スラブ・地形をそのまま切れる図面に展開する Rhino プラグインです。厚みの異なる壁も曲面の壁も問題ありません。", "一款 Rhino 插件，把墙体、楼板和地形展开成可直接切割的图纸。不同厚度的墙体和曲面墙体同样没问题。", "Un plug-in de Rhino que despliega muros, losas y terreno en planos listos para cortar. Los muros de distinto grosor y los muros curvos no son problema.", "Um plug-in do Rhino que desdobra paredes, lajes e terreno em desenhos prontos a cortar. Paredes de espessuras diferentes e paredes curvas não são problema.", "Un plug-in Rhino qui déplie murs, dalles et terrain en plans prêts à découper. Les murs d'épaisseurs différentes et les murs courbes ne posent aucun problème.", "Ein Rhino-Plug-in, das Wände, Decken und Gelände in schnittfertige Zeichnungen abwickelt. Wände unterschiedlicher Dicke und gekrümmte Wände sind kein Problem."],
  "Coming soon.": ["Coming soon.", "Coming soon.", "Coming soon.", "Coming soon.", "Coming soon.", "Coming soon."],
  "Coming soon": ["準備中", "敬请期待", "Próximamente", "Em breve", "Bientôt disponible", "Demnächst"],
  "soon": ["準備中", "敬请期待", "próximamente", "em breve", "bientôt", "demnächst"],
  "Finished quality, *in a fraction of the time.*": ["短い時間で*完成度の高い成果物を。*", "更短的时间，*更完整的成果。*", "Calidad acabada, *en una fracción del tiempo.*", "Qualidade acabada, *numa fração do tempo.*", "Une qualité aboutie, *en une fraction du temps.*", "Fertige Qualität, *in einem Bruchteil der Zeit.*"],
  "MassLabs takes the wasted hours out of an architect's day. Spend your time where it counts.": ["MassLabs は建築家の一日から無駄な時間を取り除きます。時間は本当に必要なところに使ってください。", "MassLabs 帮建筑师省下被浪费的时间，把时间花在真正要紧的地方。", "MassLabs elimina las horas perdidas del día de un arquitecto. Dedica tu tiempo a lo que importa.", "O MassLabs elimina as horas perdidas do dia de um arquiteto. Dedique o seu tempo ao que importa.", "MassLabs supprime les heures perdues dans la journée d'un architecte. Consacrez votre temps à l'essentiel.", "MassLabs nimmt verlorene Stunden aus dem Tag eines Architekten. Nutzen Sie Ihre Zeit dort, wo sie zählt."],
  "From site analysis *to laser cutting.*": ["敷地分析から*レーザーカットまで。*", "从场地分析*到激光切割。*", "Del análisis del sitio *al corte láser.*", "Da análise do terreno *ao corte a laser.*", "De l'analyse du site *à la découpe laser.*", "Von der Standortanalyse *bis zum Laserschnitt.*"],
  "Pick a tool and start right there. One account, one plan.": ["使いたい道具を選べば、その場で始まります。アカウントも料金もひとつです。", "选好工具即刻开始。一个账户，一个套餐。", "Elige una herramienta y empieza ahí mismo. Una cuenta, un plan.", "Escolha uma ferramenta e comece ali mesmo. Uma conta, um plano.", "Choisissez un outil et commencez tout de suite. Un compte, une offre.", "Werkzeug wählen und sofort loslegen. Ein Konto, ein Tarif."],
  "Wind Path": ["風の道", "风道", "Corredores de viento", "Corredores de vento", "Couloirs de vent", "Windbahnen"],
  "Cadastral Map": ["地籍図", "地籍图", "Mapa catastral", "Mapa cadastral", "Plan cadastral", "Katasterplan"],
  "LaserCutting Model": ["レーザーカット模型", "激光切割模型", "Maqueta de corte láser", "Maqueta de corte a laser", "Maquette découpée au laser", "Lasergeschnittenes Modell"],
  "Building Use": ["建物用途", "建筑用途", "Uso de edificios", "Uso dos edifícios", "Usage des bâtiments", "Gebäudenutzung"],
  "Green Space": ["緑地", "绿地", "Zonas verdes", "Espaços verdes", "Espaces verts", "Grünflächen"],
  "Site Model LaserCut": ["敷地模型レーザーカット", "场地模型激光切割", "Maqueta del terreno en corte láser", "Maqueta do terreno em corte a laser", "Maquette de site découpée au laser", "Geländemodell im Laserschnitt"],
  "Traffic Noise Information": ["交通騒音情報", "交通噪声信息", "Información de ruido de tráfico", "Informação de ruído de tráfego", "Informations sur le bruit routier", "Verkehrslärmdaten"],
  "3D Site Modeling": ["3D 敷地モデリング", "3D 场地建模", "Modelado 3D del sitio", "Modelação 3D do terreno", "Modélisation 3D du site", "3D-Geländemodellierung"],
  "Map Analysis": ["地図分析", "地图分析", "Análisis cartográfico", "Análise cartográfica", "Analyse cartographique", "Kartenanalyse"],
  "Live urban data turned into clean, editorial 2D analyses.": ["都市データをそのまま使える 2D 分析図に変えます。", "把实时城市数据变成简洁利落、可直接使用的 2D 分析图。", "Datos urbanos en vivo convertidos en análisis 2D limpios y listos para publicar.", "Dados urbanos em tempo real convertidos em análises 2D limpas e prontas a publicar.", "Des données urbaines transformées en analyses 2D nettes, prêtes à publier.", "Aktuelle Stadtdaten werden zu klaren, publikationsreifen 2D-Analysen."],
  "Site Modeling": ["敷地モデリング", "场地建模", "Modelado del sitio", "Modelação do terreno", "Modélisation du site", "Geländemodellierung"],
  "Buildings, terrain and context exported as a 3D site model.": ["建物・地形・周辺を 3D 敷地モデルとして書き出します。", "把建筑、地形与周边导出为 3D 场地模型。", "Edificios, terreno y entorno exportados como modelo 3D del sitio.", "Edifícios, terreno e envolvente exportados como modelo 3D.", "Bâtiments, terrain et contexte exportés en modèle 3D du site.", "Gebäude, Gelände und Umgebung als 3D-Geländemodell exportiert."],
  "Color Combination": ["配色", "配色", "Combinación de color", "Combinação de cores", "Combinaison de couleurs", "Farbkombination"],
  "Pick the colors for your drawings and boards.": ["図面とパネルに使う色を選びましょう。", "为图纸和展板挑选颜色。", "Elige los colores de tus planos y paneles.", "Escolha as cores dos seus desenhos e painéis.", "Choisissez les couleurs de vos plans et panneaux.", "Wählen Sie die Farben für Pläne und Tafeln."],
  "Laser Cutting": ["レーザーカット", "激光切割", "Corte láser", "Corte a laser", "Découpe laser", "Laserschnitt"],
  "Walls, slabs and terrain unfolded into cut-ready sheets.": ["壁・スラブ・地形をそのまま切れる図面に展開します。", "把墙体、楼板和地形展开成可直接切割的图纸。", "Muros, losas y terreno desplegados en láminas listas para cortar.", "Paredes, lajes e terreno desdobrados em folhas prontas a cortar.", "Murs, dalles et terrain dépliés en planches prêtes à découper.", "Wände, Decken und Gelände als schnittfertige Bögen abgewickelt."],
  "The next tool in the suite.": ["次の道具を作っています。", "正在开发下一个工具。", "La próxima herramienta del conjunto.", "A próxima ferramenta do conjunto.", "Le prochain outil de la suite.", "Das nächste Werkzeug der Suite."],
  "Tools for architects.": ["建築家のための道具。", "为建筑师打造的工具。", "Herramientas para arquitectos.", "Ferramentas para arquitetos.", "Des outils pour les architectes.", "Werkzeuge für Architekten."],

  // ── 가격 구역 ──────────────────────────────────────────────────────────
  "One subscription, *plus pay-per-piece.*": ["サブスクリプションひとつ、*そして従量課金。*", "一份订阅，*外加按件付费。*", "Una suscripción, *más pago por pieza.*", "Uma subscrição, *mais pagamento por peça.*", "Un abonnement, *plus le paiement à la pièce.*", "Ein Abonnement, *plus Abrechnung pro Stück.*"],
  "One subscription, *everything.*": ["サブスクリプションひとつで*すべて。*", "一份订阅，*全部包含。*", "Una suscripción, *todo incluido.*", "Uma subscrição, *tudo incluído.*", "Un abonnement, *tout compris.*", "Ein Abonnement, *alles drin.*"],
  "For now, archiMap and LaserFish are run separately.": ["現在、archiMap と LaserFish は分けて運用しています。", "目前 archiMap 与 LaserFish 分开运营。", "Por ahora, archiMap y LaserFish funcionan por separado.", "Por agora, o archiMap e o LaserFish funcionam em separado.", "Pour l'instant, archiMap et LaserFish fonctionnent séparément.", "Derzeit werden archiMap und LaserFish getrennt betrieben."],
  "One subscription covers every MassLabs program.": ["サブスクリプションひとつで MassLabs のすべてのプログラムを使えます。", "一份订阅即可使用 MassLabs 的所有程序。", "Una suscripción cubre todos los programas de MassLabs.", "Uma subscrição cobre todos os programas do MassLabs.", "Un seul abonnement couvre tous les programmes MassLabs.", "Ein Abonnement deckt alle MassLabs-Programme ab."],
  "For now, just sign in — archiMap PLUS is free.": ["いまはログインするだけで archiMap PLUS を無料で使えます。", "现在只需登录，即可免费使用 archiMap PLUS。", "Por ahora basta con iniciar sesión: archiMap PLUS es gratis.", "Por agora basta iniciar sessão: o archiMap PLUS é gratuito.", "Pour l'instant, il suffit de se connecter — archiMap PLUS est gratuit.", "Derzeit genügt die Anmeldung — archiMap PLUS ist kostenlos."],
  "subscription · monthly": ["サブスクリプション・月額", "订阅 · 每月", "suscripción · mensual", "subscrição · mensal", "abonnement · mensuel", "Abonnement · monatlich"],
  "Free for now": ["いまは無料", "现在免费", "Gratis por ahora", "Gratuito por agora", "Gratuit pour l'instant", "Derzeit kostenlos"],
  "pay per piece": ["従量課金", "按件付费", "pago por pieza", "pagamento por peça", "paiement à la pièce", "Abrechnung pro Stück"],
  "/ piece": ["/ 個", "/ 件", "/ pieza", "/ peça", "/ pièce", "/ Stück"],
  "Minimum order ${min} · Maximum order ${max}": ["最低注文 ${min} ・ 最高注文 ${max}", "最低下单 ${min} · 最高下单 ${max}", "Pedido mínimo ${min} · Pedido máximo ${max}", "Pedido mínimo ${min} · Pedido máximo ${max}", "Commande minimum ${min} · maximum ${max}", "Mindestbestellung ${min} · Höchstbestellung ${max}"],
  "Minimum order ${min}": ["最低注文金額 ${min}", "最低下单金额 ${min}", "Pedido mínimo ${min}", "Pedido mínimo ${min}", "Commande minimum ${min}", "Mindestbestellung ${min}"],
  "Maximum order ${max}": ["最高注文金額 ${max}", "最高下单金额 ${max}", "Pedido máximo ${max}", "Pedido máximo ${max}", "Commande maximum ${max}", "Höchstbestellung ${max}"],
  "per piece": ["1 個あたり", "每件", "por pieza", "por peça", "par pièce", "pro Stück"],
  "Get the plug-in": ["プラグインを入手", "获取插件", "Consigue el plug-in", "Obter o plug-in", "Obtenir le plug-in", "Plug-in holen"],
  "You only pay for successfully generated pieces. Failed pieces are never charged.\nAll components other than the ones listed below are free.": ["生成に成功した分だけお支払いいただきます。失敗した部分は課金されません。\n下記以外のコンポーネントは無料です。", "只对成功生成的部分收费，失败的部分不会计费。\n下列以外的构件均免费。", "Solo pagas por las piezas generadas correctamente. Las que fallan nunca se cobran.\nTodos los componentes distintos a los listados abajo son gratuitos.", "Só paga pelas peças geradas com sucesso. As que falham nunca são cobradas.\nTodos os componentes além dos listados abaixo são gratuitos.", "Vous ne payez que les pièces générées avec succès. Les échecs ne sont jamais facturés.\nTous les composants autres que ceux listés ci-dessous sont gratuits.", "Sie zahlen nur für erfolgreich erzeugte Teile. Fehlgeschlagene Teile werden nie berechnet.\nAlle Komponenten außer den unten genannten sind kostenlos."],
  "Affordable *pricing*": ["手の届く*価格帯*", "实惠的*价格*", "Precios *asequibles*", "Preços *acessíveis*", "Des *tarifs* abordables", "Erschwingliche *Preise*"],
  "Plans": ["料金プラン", "套餐", "Planes", "Planos", "Formules", "Tarife"],
  "VAT not included": ["消費税別", "不含增值税", "IVA no incluido", "IVA não incluído", "TVA non comprise", "zzgl. MwSt."],
  "Manage subscription": ["ご利用プランの管理", "管理我的订阅", "Gestionar suscripción", "Gerir subscrição", "Gérer l'abonnement", "Abonnement verwalten"],
  "You already have an active subscription.": ["すでにご登録済みです。", "您已订阅。", "Ya tienes una suscripción activa.", "Já tem uma subscrição ativa.", "Vous avez déjà un abonnement actif.", "Sie haben bereits ein aktives Abonnement."],
  "Couldn't open the checkout window.": ["決済画面を開けませんでした。", "无法打开支付窗口。", "No se pudo abrir la ventana de pago.", "Não foi possível abrir a janela de pagamento.", "Impossible d'ouvrir la fenêtre de paiement.", "Das Zahlungsfenster konnte nicht geöffnet werden."],

  // ── 요금표(PlanTable) ──────────────────────────────────────────────────
  "Current": ["ご利用中", "使用中", "Actual", "Atual", "En cours", "Aktuell"],
  "Available": ["利用可能", "可用", "Disponible", "Disponível", "Disponible", "Verfügbar"],
  "Promotion": ["期間限定", "优惠期间", "Por tiempo limitado", "Por tempo limitado", "Durée limitée", "Zeitlich begrenzt"],
  "Max diameter": ["最大直径", "最大直径", "Diámetro máximo", "Diâmetro máximo", "Diamètre maximal", "Max. Durchmesser"],
  "Credits": ["クレジット", "额度", "Créditos", "Créditos", "Crédits", "Credits"],
  "3 / mo": ["3 / 月", "3 / 月", "3 / mes", "3 / mês", "3 / mois", "3 / Monat"],
  "10 / mo": ["10 / 月", "10 / 月", "10 / mes", "10 / mês", "10 / mois", "10 / Monat"],
  "15 / mo": ["15 / 月", "15 / 月", "15 / mes", "15 / mês", "15 / mois", "15 / Monat"],
  "20 / mo": ["20 / 月", "20 / 月", "20 / mes", "20 / mês", "20 / mois", "20 / Monat"],
  "Export (2D)": ["書き出し (2D)", "导出 (2D)", "Exportar (2D)", "Exportar (2D)", "Export (2D)", "Export (2D)"],
  "3D modeling": ["3D モデリング", "3D 建模", "Modelado 3D", "Modelação 3D", "Modélisation 3D", "3D-Modellierung"],

  // ── 내 계정 ────────────────────────────────────────────────────────────
  "Log out": ["ログアウト", "退出登录", "Cerrar sesión", "Terminar sessão", "Se déconnecter", "Abmelden"],
  "Not subscribed": ["未登録", "未订阅", "Sin suscripción", "Sem subscrição", "Aucun abonnement", "Kein Abonnement"],
  "Subscribe": ["登録する", "订阅", "Suscribirse", "Subscrever", "S'abonner", "Abonnieren"],
  "Nickname": ["ニックネーム", "昵称", "Apodo", "Alcunha", "Pseudo", "Anzeigename"],
  "Edit": ["変更", "修改", "Editar", "Editar", "Modifier", "Ändern"],
  "Save": ["保存", "保存", "Guardar", "Guardar", "Enregistrer", "Speichern"],
  "Cancel": ["キャンセル", "取消", "Cancelar", "Cancelar", "Annuler", "Abbrechen"],
  "Not set": ["未設定", "未设置", "Sin definir", "Por definir", "Non défini", "Nicht festgelegt"],
  "Please use 2–20 characters.": ["2〜20 文字で入力してください。", "请使用 2–20 个字符。", "Usa entre 2 y 20 caracteres.", "Use entre 2 e 20 caracteres.", "Utilisez de 2 à 20 caractères.", "Bitte 2–20 Zeichen verwenden."],
  "That name contains characters we can't use. Please try another.": ["使用できない文字が含まれています。別の名前をお試しください。", "该名称包含无法使用的字符，请换一个。", "Ese nombre contiene caracteres que no podemos usar. Prueba con otro.", "Esse nome contém caracteres que não podemos usar. Tente outro.", "Ce nom contient des caractères que nous ne pouvons pas utiliser. Essayez-en un autre.", "Dieser Name enthält unzulässige Zeichen. Bitte wählen Sie einen anderen."],
  "Couldn't change the nickname.": ["ニックネームを変更できませんでした。", "无法修改昵称。", "No se pudo cambiar el apodo.", "Não foi possível alterar a alcunha.", "Impossible de modifier le pseudo.", "Der Anzeigename konnte nicht geändert werden."],
  "Change password": ["パスワードの変更", "修改密码", "Cambiar contraseña", "Alterar palavra-passe", "Modifier le mot de passe", "Passwort ändern"],
  "Next billing date": ["次回のお支払い日", "下次扣款日", "Próximo cobro", "Próxima cobrança", "Prochain prélèvement", "Nächste Abbuchung"],
  "First billing date": ["初回のお支払い日", "首次扣款日", "Primer cobro", "Primeira cobrança", "Premier prélèvement", "Erste Abbuchung"],
  "Amount": ["お支払い金額", "扣款金额", "Importe", "Valor", "Montant", "Betrag"],
  "Cancel subscription": ["解約する", "取消订阅", "Cancelar suscripción", "Cancelar subscrição", "Résilier l'abonnement", "Abonnement kündigen"],
  "Access ends": ["ご利用終了日", "使用截止日", "Fin del acceso", "Fim do acesso", "Fin de l'accès", "Zugang endet am"],
  "Canceled. You can keep using it until the date above.": ["解約しました。上記の日付まではそのままご利用いただけます。", "已取消。在上述日期之前仍可继续使用。", "Cancelada. Puedes seguir usándola hasta la fecha indicada arriba.", "Cancelada. Pode continuar a usar até à data acima.", "Résilié. Vous pouvez continuer à l'utiliser jusqu'à la date ci-dessus.", "Gekündigt. Bis zum oben genannten Datum bleibt der Zugang bestehen."],
  "Payment failed, so access is paused. Please subscribe again.": ["お支払いに失敗したため、ご利用を停止しています。もう一度ご登録ください。", "扣款失败，服务已暂停。请重新订阅。", "El pago falló y el acceso está en pausa. Vuelve a suscribirte.", "O pagamento falhou e o acesso está suspenso. Volte a subscrever.", "Le paiement a échoué, l'accès est suspendu. Veuillez vous réabonner.", "Die Zahlung ist fehlgeschlagen, der Zugang ist pausiert. Bitte erneut abonnieren."],
  "You have admin access to every program.": ["管理者権限ですべてのプログラムをご利用中です。", "您正以管理员权限使用全部程序。", "Tienes acceso de administrador a todos los programas.", "Tem acesso de administrador a todos os programas.", "Vous disposez d'un accès administrateur à tous les programmes.", "Sie haben Administratorzugriff auf alle Programme."],
  "Couldn't cancel the subscription.": ["解約できませんでした。", "无法取消订阅。", "No se pudo cancelar la suscripción.", "Não foi possível cancelar a subscrição.", "Impossible de résilier l'abonnement.", "Das Abonnement konnte nicht gekündigt werden."],
  "Close account": ["退会", "注销账户", "Eliminar cuenta", "Eliminar conta", "Supprimer le compte", "Konto löschen"],
  "Closing…": ["退会処理中…", "注销中…", "Eliminando…", "A eliminar…", "Suppression…", "Wird gelöscht…"],
  "Couldn't close the account. Please try again in a moment.": ["退会に失敗しました。しばらくしてからもう一度お試しください。", "注销失败，请稍后再试。", "No se pudo eliminar la cuenta. Inténtalo de nuevo en un momento.", "Não foi possível eliminar a conta. Tente novamente dentro de momentos.", "Impossible de supprimer le compte. Veuillez réessayer dans un instant.", "Das Konto konnte nicht gelöscht werden. Bitte gleich erneut versuchen."],
  "Closing your account permanently deletes it, along with:\n\n· your plan and any remaining credits\n· the styles and reference images saved in archiMap\n· your linked devices and plugin sign-ins\n\nAny running subscription ends immediately and the remaining time is not refunded.\nContinue?": [
    "退会すると、アカウントとともに次のものがすべて消え、元に戻せません。\n\n・ご利用プランと残りのクレジット\n・archiMap に保存したスタイルと参考画像\n・連携済みの端末とプラグインのログイン\n\nご利用中のサブスクリプションは直ちに終了し、残り期間の返金はありません。\n続けますか？",
    "注销后，账户及以下内容都会被删除，且无法恢复。\n\n· 使用等级与剩余额度\n· 保存在 archiMap 的样式和参考图片\n· 已连接的设备与插件登录\n\n正在使用的订阅会立即结束，剩余时间不予退款。\n要继续吗？",
    "Al eliminar la cuenta se borra de forma permanente, junto con:\n\n· tu plan y los créditos restantes\n· los estilos e imágenes de referencia guardados en archiMap\n· tus dispositivos vinculados y los inicios de sesión del plug-in\n\nCualquier suscripción activa termina de inmediato y el tiempo restante no se reembolsa.\n¿Continuar?",
    "Ao eliminar a conta, esta é apagada definitivamente, juntamente com:\n\n· o seu plano e os créditos restantes\n· os estilos e imagens de referência guardados no archiMap\n· os dispositivos associados e os inícios de sessão do plug-in\n\nQualquer subscrição ativa termina de imediato e o tempo restante não é reembolsado.\nContinuar?",
    "Supprimer votre compte l'efface définitivement, avec :\n\n· votre formule et les crédits restants\n· les styles et images de référence enregistrés dans archiMap\n· vos appareils liés et les connexions du plug-in\n\nTout abonnement en cours prend fin immédiatement et le temps restant n'est pas remboursé.\nContinuer ?",
    "Beim Löschen wird Ihr Konto endgültig entfernt, zusammen mit:\n\n· Ihrem Tarif und verbleibenden Credits\n· den in archiMap gespeicherten Stilen und Referenzbildern\n· Ihren verknüpften Geräten und Plug-in-Anmeldungen\n\nEin laufendes Abonnement endet sofort, die Restlaufzeit wird nicht erstattet.\nFortfahren?",
  ],
  "Are you sure? Confirming this deletes your account right away.": ["本当に退会しますか？ この確認でアカウントは直ちに削除されます。", "确定要注销吗？确认后账户会立即删除。", "¿Seguro? Al confirmar, tu cuenta se elimina de inmediato.", "Tem a certeza? Ao confirmar, a conta é eliminada de imediato.", "Êtes-vous sûr ? En confirmant, votre compte est supprimé immédiatement.", "Sind Sie sicher? Mit der Bestätigung wird Ihr Konto sofort gelöscht."],
  "Cancel your subscription?\nYou can keep using it through the period you've already paid for.": ["解約しますか？\nお支払い済みの期間まではそのままご利用いただけます。", "要取消订阅吗？\n已付费的期间仍可继续使用。", "¿Cancelar tu suscripción?\nPuedes seguir usándola durante el periodo ya pagado.", "Cancelar a subscrição?\nPode continuar a usar durante o período já pago.", "Résilier votre abonnement ?\nVous pouvez continuer à l'utiliser jusqu'à la fin de la période déjà payée.", "Abonnement kündigen?\nSie können es bis zum Ende des bereits bezahlten Zeitraums weiter nutzen."],

  // ── 비밀번호 ───────────────────────────────────────────────────────────
  "Set a password": ["パスワードの設定", "设置密码", "Establecer contraseña", "Definir palavra-passe", "Définir un mot de passe", "Passwort festlegen"],
  "Right now you can only log in with Google. Set a password and you can log in with your email address too.": ["いまは Google ログインのみ利用できます。パスワードを決めると、メールアドレスでもログインできます。", "目前只能用 Google 登录。设置密码后，也可以用邮箱登录。", "Ahora mismo solo puedes iniciar sesión con Google. Si defines una contraseña, también podrás entrar con tu correo.", "Neste momento só pode iniciar sessão com o Google. Se definir uma palavra-passe, também poderá entrar com o seu e-mail.", "Pour l'instant, vous ne pouvez vous connecter qu'avec Google. Définissez un mot de passe pour vous connecter aussi avec votre e-mail.", "Derzeit können Sie sich nur mit Google anmelden. Legen Sie ein Passwort fest, dann geht es auch per E-Mail-Adresse."],
  "Change": ["変更", "修改", "Cambiar", "Alterar", "Modifier", "Ändern"],
  "Set": ["設定", "设置", "Establecer", "Definir", "Définir", "Festlegen"],
  "Current password": ["現在のパスワード", "当前密码", "Contraseña actual", "Palavra-passe atual", "Mot de passe actuel", "Aktuelles Passwort"],
  "New password": ["新しいパスワード", "新密码", "Nueva contraseña", "Nova palavra-passe", "Nouveau mot de passe", "Neues Passwort"],
  "Password": ["パスワード", "密码", "Contraseña", "Palavra-passe", "Mot de passe", "Passwort"],
  "Confirm password": ["パスワードの確認", "确认密码", "Confirmar contraseña", "Confirmar palavra-passe", "Confirmer le mot de passe", "Passwort bestätigen"],
  "Confirm new password": ["新しいパスワードの確認", "确认新密码", "Confirmar la nueva contraseña", "Confirmar a nova palavra-passe", "Confirmer le nouveau mot de passe", "Neues Passwort bestätigen"],
  "Enter it again": ["もう一度入力", "再输入一次", "Escríbela otra vez", "Escreva novamente", "Saisissez-le à nouveau", "Noch einmal eingeben"],
  "Show password": ["パスワードを表示", "显示密码", "Mostrar contraseña", "Mostrar palavra-passe", "Afficher le mot de passe", "Passwort anzeigen"],
  "Hide password": ["パスワードを隠す", "隐藏密码", "Ocultar contraseña", "Ocultar palavra-passe", "Masquer le mot de passe", "Passwort verbergen"],
  "That current password isn't right.": ["現在のパスワードが正しくありません。", "当前密码不正确。", "La contraseña actual no es correcta.", "A palavra-passe atual não está correta.", "Le mot de passe actuel est incorrect.", "Das aktuelle Passwort stimmt nicht."],
  "That current password was wrong too many times. Try again in {n}s.": ["現在のパスワードを何度も間違えました。{n} 秒後にもう一度お試しください。", "当前密码错误次数过多，请在 {n} 秒后重试。", "Has fallado la contraseña actual demasiadas veces. Inténtalo en {n} s.", "Errou a palavra-passe atual demasiadas vezes. Tente daqui a {n} s.", "Mot de passe actuel erroné trop de fois. Réessayez dans {n} s.", "Das aktuelle Passwort war zu oft falsch. Versuchen Sie es in {n} s erneut."],
  "The two boxes don't match. Please type the same password twice.": ["2 つの欄が一致しません。同じパスワードを入力してください。", "两个输入框不一致，请输入相同的密码。", "Las dos casillas no coinciden. Escribe la misma contraseña dos veces.", "Os dois campos não coincidem. Escreva a mesma palavra-passe duas vezes.", "Les deux champs ne correspondent pas. Saisissez deux fois le même mot de passe.", "Die beiden Felder stimmen nicht überein. Bitte dasselbe Passwort zweimal eingeben."],
  "Password must be at least 6 characters.": ["パスワードは 6 文字以上にしてください。", "密码至少需要 6 个字符。", "La contraseña debe tener al menos 6 caracteres.", "A palavra-passe deve ter pelo menos 6 caracteres.", "Le mot de passe doit comporter au moins 6 caractères.", "Das Passwort muss mindestens 6 Zeichen haben."],
  "Please choose a password different from your current one.": ["いまお使いのものとは違うパスワードにしてください。", "请设置与当前不同的密码。", "Elige una contraseña distinta de la actual.", "Escolha uma palavra-passe diferente da atual.", "Choisissez un mot de passe différent de l'actuel.", "Bitte ein anderes als das aktuelle Passwort wählen."],
  "That password is too easy to guess. Please choose another.": ["推測されやすいパスワードです。別のものにしてください。", "该密码过于简单，请换一个。", "Esa contraseña es demasiado fácil de adivinar. Elige otra.", "Essa palavra-passe é demasiado fácil de adivinhar. Escolha outra.", "Ce mot de passe est trop facile à deviner. Choisissez-en un autre.", "Dieses Passwort ist zu leicht zu erraten. Bitte ein anderes wählen."],
  "For safety, please log in again before changing your password.": ["安全のため、もう一度ログインしてから変更してください。", "为了安全，请重新登录后再修改。", "Por seguridad, vuelve a iniciar sesión antes de cambiar la contraseña.", "Por segurança, inicie sessão novamente antes de alterar a palavra-passe.", "Par sécurité, reconnectez-vous avant de changer votre mot de passe.", "Bitte melden Sie sich aus Sicherheitsgründen erneut an, bevor Sie das Passwort ändern."],
  "Your login has expired. Please log in again.": ["ログインの有効期限が切れました。もう一度ログインしてください。", "登录已过期，请重新登录。", "Tu sesión ha caducado. Inicia sesión de nuevo.", "A sua sessão expirou. Inicie sessão novamente.", "Votre session a expiré. Veuillez vous reconnecter.", "Ihre Anmeldung ist abgelaufen. Bitte erneut anmelden."],
  "Couldn't change the password. Please try again in a moment.": ["パスワードを変更できませんでした。しばらくしてからもう一度お試しください。", "无法修改密码，请稍后再试。", "No se pudo cambiar la contraseña. Inténtalo de nuevo en un momento.", "Não foi possível alterar a palavra-passe. Tente novamente dentro de momentos.", "Impossible de modifier le mot de passe. Veuillez réessayer dans un instant.", "Das Passwort konnte nicht geändert werden. Bitte gleich erneut versuchen."],
  "Your password has been changed. From your next login, use {email} and the new password.": ["パスワードを変更しました。次回からは {email} と新しいパスワードでログインしてください。", "密码已修改。下次请使用 {email} 和新密码登录。", "Tu contraseña se ha cambiado. A partir del próximo inicio de sesión, usa {email} y la nueva contraseña.", "A sua palavra-passe foi alterada. A partir do próximo início de sessão, use {email} e a nova palavra-passe.", "Votre mot de passe a été modifié. Dès la prochaine connexion, utilisez {email} et le nouveau mot de passe.", "Ihr Passwort wurde geändert. Verwenden Sie ab der nächsten Anmeldung {email} und das neue Passwort."],
  "Your password is set. You can now log in with {email} and this password, as well as with Google.": ["パスワードを設定しました。これからは Google のほかに {email} とこのパスワードでもログインできます。", "密码已设置。今后除了 Google，也可以用 {email} 和这个密码登录。", "Tu contraseña está lista. Ahora puedes entrar con {email} y esta contraseña, además de con Google.", "A sua palavra-passe está definida. Agora pode entrar com {email} e esta palavra-passe, além do Google.", "Votre mot de passe est défini. Vous pouvez désormais vous connecter avec {email} et ce mot de passe, en plus de Google.", "Ihr Passwort ist festgelegt. Sie können sich nun mit {email} und diesem Passwort anmelden — zusätzlich zu Google."],
  "Log in again": ["もう一度ログイン", "重新登录", "Iniciar sesión de nuevo", "Iniciar sessão novamente", "Se reconnecter", "Erneut anmelden"],
  "Choose the password you'll use from now on.": ["これから使うパスワードを決めてください。", "请设置今后使用的密码。", "Elige la contraseña que usarás a partir de ahora.", "Escolha a palavra-passe que vai usar a partir de agora.", "Choisissez le mot de passe que vous utiliserez désormais.", "Wählen Sie das Passwort, das Sie künftig verwenden."],
  "Your password has been changed. Taking you back…": ["パスワードを変更しました。まもなく移動します。", "密码已修改，正在返回…", "Tu contraseña se ha cambiado. Te llevamos de vuelta…", "A sua palavra-passe foi alterada. A voltar…", "Votre mot de passe a été modifié. Retour en cours…", "Ihr Passwort wurde geändert. Sie werden zurückgeleitet…"],
  "That reset link has expired or isn't valid. Please request a new one.": ["再設定リンクの期限が切れているか、正しくありません。もう一度ご請求ください。", "重置链接已过期或无效，请重新申请。", "Ese enlace de restablecimiento ha caducado o no es válido. Solicita uno nuevo.", "Esse link de reposição expirou ou não é válido. Peça um novo.", "Ce lien de réinitialisation a expiré ou n'est pas valide. Demandez-en un nouveau.", "Dieser Link ist abgelaufen oder ungültig. Bitte einen neuen anfordern."],
  "That reset link has expired. Please request a new email.": ["再設定リンクの有効期限が過ぎました。メールをもう一度お受け取りください。", "重置链接已过期，请重新接收邮件。", "Ese enlace de restablecimiento ha caducado. Solicita un nuevo correo.", "Esse link de reposição expirou. Peça um novo e-mail.", "Ce lien de réinitialisation a expiré. Demandez un nouvel e-mail.", "Dieser Link ist abgelaufen. Bitte eine neue E-Mail anfordern."],
  "That reset link isn't valid. Please use the button in the email itself.": ["再設定リンクが正しくありません。メール内のボタンを直接押してください。", "重置链接无效，请直接点击邮件中的按钮。", "Ese enlace de restablecimiento no es válido. Usa el botón del propio correo.", "Esse link de reposição não é válido. Use o botão do próprio e-mail.", "Ce lien de réinitialisation n'est pas valide. Utilisez le bouton dans l'e-mail.", "Dieser Link ist ungültig. Bitte den Button in der E-Mail selbst verwenden."],
  "Open the link on the device and browser you requested it from. Request a new email here instead.": ["リンクは請求した端末・ブラウザで開いてください。もしくは、このブラウザで新しくお受け取りください。", "请在申请时使用的设备和浏览器中打开链接，或在此浏览器重新接收邮件。", "Abre el enlace en el dispositivo y navegador desde el que lo solicitaste, o pide aquí un nuevo correo.", "Abra o link no dispositivo e navegador a partir dos quais o pediu, ou peça aqui um novo e-mail.", "Ouvrez le lien sur l'appareil et le navigateur d'origine de la demande, ou demandez un nouvel e-mail ici.", "Öffnen Sie den Link auf dem Gerät und im Browser, von dem aus Sie ihn angefordert haben — oder fordern Sie hier eine neue E-Mail an."],
  "Send a new reset email": ["再設定メールをもう一度受け取る", "重新接收重置邮件", "Enviar un nuevo correo de restablecimiento", "Enviar um novo e-mail de reposição", "Recevoir un nouvel e-mail de réinitialisation", "Neue Zurücksetzungs-E-Mail senden"],

  // ── 로그인·가입 ────────────────────────────────────────────────────────
  // "Login" 은 위 홈 구역에 이미 있다 — 열쇠가 같으면 한 줄이면 된다.
  "Create account": ["会員登録", "注册", "Crear cuenta", "Criar conta", "Créer un compte", "Konto erstellen"],
  "Reset password": ["パスワードの再設定", "重置密码", "Restablecer contraseña", "Repor palavra-passe", "Réinitialiser le mot de passe", "Passwort zurücksetzen"],
  "Continue with Google": ["Google で続ける", "使用 Google 继续", "Continuar con Google", "Continuar com o Google", "Continuer avec Google", "Mit Google fortfahren"],
  "New here? Your Google account gets you started right away.": ["はじめての方は、Google アカウントですぐに始められます。", "第一次使用？用 Google 账号即可马上开始。", "¿Es tu primera vez? Con tu cuenta de Google empiezas al instante.", "É a primeira vez? Com a sua conta Google começa de imediato.", "C'est votre première fois ? Votre compte Google vous lance tout de suite.", "Zum ersten Mal hier? Mit Ihrem Google-Konto geht es sofort los."],
  "Google login isn't available right now.": ["Google ログインは現在ご利用いただけません。", "当前无法使用 Google 登录。", "El inicio de sesión con Google no está disponible ahora mismo.", "O início de sessão com o Google não está disponível de momento.", "La connexion Google n'est pas disponible pour le moment.", "Die Google-Anmeldung ist derzeit nicht verfügbar."],
  "Those passwords don't match.": ["パスワードが一致しません。", "两次输入的密码不一致。", "Las contraseñas no coinciden.", "As palavras-passe não coincidem.", "Les mots de passe ne correspondent pas.", "Die Passwörter stimmen nicht überein."],
  "or": ["または", "或", "o", "ou", "ou", "oder"],
  "Forgot your password?": ["パスワードをお忘れですか？", "忘记密码？", "¿Olvidaste tu contraseña?", "Esqueceu-se da palavra-passe?", "Mot de passe oublié ?", "Passwort vergessen?"],
  "Back to login": ["ログインに戻る", "返回登录", "Volver a iniciar sesión", "Voltar a iniciar sessão", "Retour à la connexion", "Zurück zur Anmeldung"],
  "We've sent a confirmation email. Please click the link inside.": ["確認メールを送りました。メール内のリンクを押してください。", "已发送确认邮件，请点击邮件中的链接。", "Te hemos enviado un correo de confirmación. Pulsa el enlace que contiene.", "Enviámos um e-mail de confirmação. Clique no link que ele contém.", "Nous avons envoyé un e-mail de confirmation. Cliquez sur le lien qu'il contient.", "Wir haben eine Bestätigungs-E-Mail gesendet. Bitte klicken Sie auf den Link darin."],
  "We've sent a password reset email.": ["パスワード再設定メールを送りました。", "已发送密码重置邮件。", "Te hemos enviado un correo para restablecer la contraseña.", "Enviámos um e-mail para repor a palavra-passe.", "Nous avons envoyé un e-mail de réinitialisation du mot de passe.", "Wir haben eine E-Mail zum Zurücksetzen des Passworts gesendet."],
  "That email or password isn't right.": ["メールアドレスまたはパスワードが正しくありません。", "邮箱或密码不正确。", "Ese correo o esa contraseña no son correctos.", "Esse e-mail ou palavra-passe não estão corretos.", "Cet e-mail ou ce mot de passe est incorrect.", "E-Mail-Adresse oder Passwort stimmen nicht."],
  "That email is already registered.": ["すでに登録済みのメールアドレスです。", "该邮箱已注册。", "Ese correo ya está registrado.", "Esse e-mail já está registado.", "Cet e-mail est déjà enregistré.", "Diese E-Mail-Adresse ist bereits registriert."],
  "Please click the confirmation link in your email first.": ["まずメール内の確認リンクを押してください。", "请先点击邮件中的确认链接。", "Primero pulsa el enlace de confirmación de tu correo.", "Clique primeiro no link de confirmação do seu e-mail.", "Cliquez d'abord sur le lien de confirmation dans votre e-mail.", "Bitte klicken Sie zuerst auf den Bestätigungslink in Ihrer E-Mail."],
  "Email address": ["メールアドレス", "邮箱地址", "Correo electrónico", "Endereço de e-mail", "Adresse e-mail", "E-Mail-Adresse"],

  // ── 가입 직후(국가) ────────────────────────────────────────────────────
  "Where do you live?": ["お住まいはどちらですか？", "您居住在哪里？", "¿Dónde vives?", "Onde vive?", "Où habitez-vous ?", "Wo wohnen Sie?"],
  "We use it to set your billing currency and tax handling. You can change it later.": ["決済通貨と税の扱いを決めるために使います。あとから変更できます。", "用于确定结算币种与税务处理方式。之后可以修改。", "Lo usamos para fijar tu moneda de pago y el tratamiento fiscal. Puedes cambiarlo más adelante.", "Usamos isto para definir a moeda de pagamento e o tratamento fiscal. Pode alterar mais tarde.", "Nous l'utilisons pour définir votre devise de paiement et le traitement fiscal. Vous pourrez le modifier plus tard.", "Wir legen damit Ihre Abrechnungswährung und die Steuerbehandlung fest. Später änderbar."],
  "Continue": ["続ける", "继续", "Continuar", "Continuar", "Continuer", "Weiter"],
  "Skip for now": ["あとで設定する", "稍后再说", "Ahora no", "Agora não", "Plus tard", "Später"],
  "Couldn't save that. Please try again in a moment.": ["保存できませんでした。しばらくしてからもう一度お試しください。", "无法保存，请稍后再试。", "No se pudo guardar. Inténtalo de nuevo en un momento.", "Não foi possível guardar. Tente novamente dentro de momentos.", "Impossible d'enregistrer. Veuillez réessayer dans un instant.", "Konnte nicht gespeichert werden. Bitte gleich erneut versuchen."],

  // ── 라이노 기기 연결 ───────────────────────────────────────────────────
  "Device connected": ["接続しました", "设备已连接", "Dispositivo conectado", "Dispositivo ligado", "Appareil connecté", "Gerät verbunden"],
  "Go back to Rhino and click ": ["Rhino に戻って ", "请回到 Rhino，点击 ", "Vuelve a Rhino y pulsa ", "Volte ao Rhino e clique em ", "Retournez dans Rhino et cliquez sur ", "Kehren Sie zu Rhino zurück und klicken Sie auf "],
  " to finish.": [" を押してください。", " 完成。", " para terminar.", " para terminar.", " pour terminer.", " , um abzuschließen."],
  "Connect Rhino": ["Rhino の接続", "连接 Rhino", "Conectar Rhino", "Ligar o Rhino", "Connecter Rhino", "Rhino verbinden"],
  "Enter the code shown in Rhino.": ["Rhino の画面に表示された 6 桁のコードを入力してください。", "请输入 Rhino 界面上显示的 6 位代码。", "Introduce el código que aparece en Rhino.", "Introduza o código apresentado no Rhino.", "Saisissez le code affiché dans Rhino.", "Geben Sie den in Rhino angezeigten Code ein."],
  "Account": ["アカウント", "账户", "Cuenta", "Conta", "Compte", "Konto"],
  "Connecting…": ["接続中…", "连接中…", "Conectando…", "A ligar…", "Connexion…", "Wird verbunden…"],
  "Connect": ["接続する", "连接", "Conectar", "Ligar", "Connecter", "Verbinden"],
  "If you didn't start this from Rhino, please close this window.": ["Rhino からログインを始めていない場合は、この画面を閉じてください。", "如果不是从 Rhino 发起的登录，请关闭此窗口。", "Si no iniciaste esto desde Rhino, cierra esta ventana.", "Se não iniciou isto a partir do Rhino, feche esta janela.", "Si vous n'avez pas lancé cette opération depuis Rhino, fermez cette fenêtre.", "Wenn Sie dies nicht aus Rhino gestartet haben, schließen Sie dieses Fenster bitte."],
  "We couldn't find that code. Please double-check the code shown in Rhino.": ["コードが見つかりません。Rhino の画面のコードをもう一度ご確認ください。", "找不到该代码，请再次核对 Rhino 界面上的代码。", "No encontramos ese código. Vuelve a comprobar el código que aparece en Rhino.", "Não encontrámos esse código. Verifique novamente o código apresentado no Rhino.", "Code introuvable. Vérifiez à nouveau le code affiché dans Rhino.", "Wir konnten diesen Code nicht finden. Bitte prüfen Sie den in Rhino angezeigten Code."],
  "Please enter the 6-character code.": ["6 桁のコードを入力してください。", "请输入 6 位代码。", "Introduce el código de 6 caracteres.", "Introduza o código de 6 caracteres.", "Saisissez le code à 6 caractères.", "Bitte den 6-stelligen Code eingeben."],
  "Please start the login again from Rhino in a moment.": ["しばらくしてから Rhino でもう一度お試しください。", "请稍后在 Rhino 中重新开始。", "Vuelve a iniciar sesión desde Rhino en un momento.", "Volte a iniciar sessão a partir do Rhino dentro de momentos.", "Relancez la connexion depuis Rhino dans un instant.", "Bitte starten Sie die Anmeldung gleich erneut in Rhino."],
  "Your session expired. Please refresh and try again.": ["ログインの有効期限が切れました。再読み込みしてもう一度お試しください。", "登录已过期，请刷新后重试。", "Tu sesión ha caducado. Actualiza la página e inténtalo de nuevo.", "A sua sessão expirou. Atualize a página e tente novamente.", "Votre session a expiré. Actualisez la page et réessayez.", "Ihre Sitzung ist abgelaufen. Bitte aktualisieren und erneut versuchen."],
  "Couldn't connect this device.": ["接続に失敗しました。", "无法连接此设备。", "No se pudo conectar este dispositivo.", "Não foi possível ligar este dispositivo.", "Impossible de connecter cet appareil.", "Dieses Gerät konnte nicht verbunden werden."],

  // ── 건당결제(LaserFish) ────────────────────────────────────────────────
  "Complete Your Drawing": ["図面を仕上げる", "完成您的图纸", "Completa tu plano", "Conclua o seu desenho", "Terminez votre plan", "Zeichnung abschließen"],
  "Pieces": ["個数", "件数", "Piezas", "Peças", "Pièces", "Teile"],
  "Cost": ["金額", "金额", "Importe", "Custo", "Coût", "Kosten"],
  "Total": ["合計", "合计", "Total", "Total", "Total", "Gesamt"],
  "You only pay for what’s generated.": ["生成された分だけお支払いいただきます。", "只对已生成的部分收费。", "Solo pagas por lo que se genera.", "Só paga o que for gerado.", "Vous ne payez que ce qui est généré.", "Sie zahlen nur für das, was erzeugt wird."],
  "If any part fails, it won’t be charged.": ["失敗した部分は課金されません。", "失败的部分不会计费。", "Si alguna parte falla, no se cobra.", "Se alguma parte falhar, não é cobrada.", "En cas d'échec, la partie concernée n'est pas facturée.", "Fehlgeschlagene Teile werden nicht berechnet."],
  "Enter your email to receive your receipt.": ["領収書をお送りするメールアドレスを入力してください。", "请输入用于接收收据的邮箱。", "Introduce tu correo para recibir el recibo.", "Introduza o seu e-mail para receber o recibo.", "Saisissez votre e-mail pour recevoir le reçu.", "Geben Sie Ihre E-Mail-Adresse für den Beleg ein."],
  "I agree to the": ["に同意します", "我同意", "Acepto los", "Aceito os", "J'accepte les", "Ich stimme den"],
  "terms & policy": ["利用規約・ポリシー", "服务条款与政策", "términos y la política", "termos e a política", "conditions et la politique", "Bedingungen und Richtlinien zu"],
  "Pay": ["支払う", "支付", "Pagar", "Pagar", "Payer", "Bezahlen"],
  "Please enter your email.": ["メールアドレスを入力してください。", "请输入邮箱。", "Introduce tu correo electrónico.", "Introduza o seu e-mail.", "Veuillez saisir votre e-mail.", "Bitte geben Sie Ihre E-Mail-Adresse ein."],
  "Payment was cancelled or failed. Please try again.": ["決済がキャンセルされたか失敗しました。もう一度お試しください。", "支付已取消或失败，请重试。", "El pago se canceló o falló. Inténtalo de nuevo.", "O pagamento foi cancelado ou falhou. Tente novamente.", "Le paiement a été annulé ou a échoué. Veuillez réessayer.", "Die Zahlung wurde abgebrochen oder ist fehlgeschlagen. Bitte erneut versuchen."],
  "An error occurred during payment. Please try again.": ["決済処理中にエラーが発生しました。もう一度お試しください。", "支付过程中发生错误，请重试。", "Se produjo un error durante el pago. Inténtalo de nuevo.", "Ocorreu um erro durante o pagamento. Tente novamente.", "Une erreur s'est produite pendant le paiement. Veuillez réessayer.", "Bei der Zahlung ist ein Fehler aufgetreten. Bitte erneut versuchen."],
  "Verifying payment...": ["決済を確認しています…", "正在确认支付…", "Verificando el pago…", "A verificar o pagamento…", "Vérification du paiement…", "Zahlung wird geprüft…"],
  "Payment Failed": ["決済に失敗しました", "支付失败", "Pago fallido", "Pagamento falhou", "Échec du paiement", "Zahlung fehlgeschlagen"],
  "Something went wrong during payment. Please try again.": ["決済中に問題が発生しました。もう一度お試しください。", "支付过程中出现问题，请重试。", "Algo salió mal durante el pago. Inténtalo de nuevo.", "Algo correu mal durante o pagamento. Tente novamente.", "Un problème est survenu pendant le paiement. Veuillez réessayer.", "Bei der Zahlung ist etwas schiefgelaufen. Bitte erneut versuchen."],
  "Payment Complete!": ["決済が完了しました！", "支付完成！", "¡Pago completado!", "Pagamento concluído!", "Paiement terminé !", "Zahlung abgeschlossen!"],
  "Thank you for your purchase.": ["ご購入ありがとうございます。", "感谢您的购买。", "Gracias por tu compra.", "Obrigado pela sua compra.", "Merci pour votre achat.", "Vielen Dank für Ihren Einkauf."],
  "Please wait while your model is being generated.": ["モデルを生成しています。しばらくお待ちください。", "正在生成模型，请稍候。", "Espera mientras se genera tu modelo.", "Aguarde enquanto o seu modelo é gerado.", "Veuillez patienter pendant la génération de votre modèle.", "Bitte warten Sie, während Ihr Modell erzeugt wird."],
  "Nothing was generated.": ["何も生成されませんでした", "没有生成任何内容", "No se generó nada.", "Não foi gerado nada.", "Rien n'a été généré.", "Es wurde nichts erzeugt."],
  "There are no pieces to pay for.": ["生成された個数がないため、お支払いの対象がありません。", "没有已生成的部分，因此没有需要支付的项目。", "No hay piezas que pagar.", "Não há peças a pagar.", "Aucune pièce à payer.", "Es gibt keine Teile zu bezahlen."],
  "Wall": ["壁", "墙体", "Muro", "Parede", "Mur", "Wand"],
  "Slab": ["スラブ", "楼板", "Losa", "Laje", "Dalle", "Decke"],
  "Stair": ["階段", "楼梯", "Escalera", "Escada", "Escalier", "Treppe"],
  "Window": ["窓", "窗户", "Ventana", "Janela", "Fenêtre", "Fenster"],
  "Roof": ["屋根", "屋顶", "Cubierta", "Cobertura", "Toiture", "Dach"],
  "Terrain": ["地形", "地形", "Terreno", "Terreno", "Terrain", "Gelände"],
  "Building": ["建物", "建筑", "Edificio", "Edifício", "Bâtiment", "Gebäude"],

  // ── 후기 ──────────────────────────────────────────────────────────────
  "Leave a Review": ["レビューを書く", "写下评价", "Deja una reseña", "Deixe uma avaliação", "Laisser un avis", "Bewertung schreiben"],
  "Upload a photo of your result and write a short review.": ["完成した結果の写真をアップロードして、短い感想を書いてください。", "上传成果照片，并写下简短评价。", "Sube una foto de tu resultado y escribe una reseña breve.", "Carregue uma foto do seu resultado e escreva uma avaliação curta.", "Téléversez une photo de votre résultat et rédigez un court avis.", "Laden Sie ein Foto Ihres Ergebnisses hoch und schreiben Sie eine kurze Bewertung."],
  "Photo": ["写真", "照片", "Foto", "Foto", "Photo", "Foto"],
  "Upload your result photo": ["結果の写真をアップロード", "上传成果照片", "Sube la foto de tu resultado", "Carregue a foto do seu resultado", "Téléversez la photo de votre résultat", "Ergebnisfoto hochladen"],
  "Enter your nickname": ["ニックネームを入力", "请输入昵称", "Escribe tu apodo", "Escreva a sua alcunha", "Saisissez votre pseudo", "Anzeigenamen eingeben"],
  "Review": ["レビュー", "评价", "Reseña", "Avaliação", "Avis", "Bewertung"],
  "Share your experience...": ["使ってみた感想をお聞かせください…", "分享您的使用体验…", "Cuéntanos tu experiencia…", "Conte-nos a sua experiência…", "Partagez votre expérience…", "Erzählen Sie von Ihrer Erfahrung…"],
  "Submit Review": ["レビューを送る", "提交评价", "Enviar reseña", "Enviar avaliação", "Envoyer l'avis", "Bewertung senden"],
  "Submitting...": ["送信中…", "提交中…", "Enviando…", "A enviar…", "Envoi…", "Wird gesendet…"],
  "Thank you!": ["ありがとうございます！", "谢谢！", "¡Gracias!", "Obrigado!", "Merci !", "Vielen Dank!"],
  "Your review has been submitted. Thank you for your feedback.": ["レビューを送信しました。ご意見ありがとうございます。", "评价已提交，感谢您的反馈。", "Tu reseña se ha enviado. Gracias por tus comentarios.", "A sua avaliação foi enviada. Obrigado pelo seu contributo.", "Votre avis a été envoyé. Merci pour votre retour.", "Ihre Bewertung wurde gesendet. Danke für Ihr Feedback."],

  // ── 구독 결제 ──────────────────────────────────────────────────────────
  "This link isn't valid.": ["アドレスが正しくありません。", "地址不正确。", "Este enlace no es válido.", "Este link não é válido.", "Ce lien n'est pas valide.", "Dieser Link ist ungültig."],
  "This checkout request has expired. Please try again from the app.": ["決済リクエストの有効期限が切れました。アプリからもう一度お試しください。", "支付请求已过期，请在应用中重试。", "Esta solicitud de pago ha caducado. Inténtalo de nuevo desde la aplicación.", "Este pedido de pagamento expirou. Tente novamente a partir da aplicação.", "Cette demande de paiement a expiré. Réessayez depuis l'application.", "Diese Zahlungsanfrage ist abgelaufen. Bitte in der App erneut versuchen."],
  "This request has already been processed.": ["すでに処理済みのリクエストです。", "该请求已处理。", "Esta solicitud ya se ha procesado.", "Este pedido já foi processado.", "Cette demande a déjà été traitée.", "Diese Anfrage wurde bereits bearbeitet."],
  "Checkout request not found.": ["決済リクエストが見つかりません。", "找不到支付请求。", "No se encontró la solicitud de pago.", "Pedido de pagamento não encontrado.", "Demande de paiement introuvable.", "Zahlungsanfrage nicht gefunden."],
  "This plan isn't available right now.": ["現在販売していないプランです。", "目前暂不提供该套餐。", "Este plan no está disponible ahora mismo.", "Este plano não está disponível de momento.", "Cette formule n'est pas disponible pour le moment.", "Dieser Tarif ist derzeit nicht verfügbar."],
  "You already have the all-access subscription, so no separate purchase is needed.": ["すでに全体サブスクリプションをご利用中のため、このプログラムを個別に購入する必要はありません。", "您已订阅全部功能，无需单独购买该程序。", "Ya tienes la suscripción con acceso total, así que no hace falta comprarlo por separado.", "Já tem a subscrição de acesso total, pelo que não é necessária uma compra em separado.", "Vous avez déjà l'abonnement tout compris : aucun achat séparé n'est nécessaire.", "Sie haben bereits das Komplett-Abonnement — ein separater Kauf ist nicht nötig."],
  "Couldn't load your checkout details.": ["決済情報を読み込めませんでした。", "无法加载支付信息。", "No se pudieron cargar los datos de pago.", "Não foi possível carregar os dados de pagamento.", "Impossible de charger les informations de paiement.", "Die Zahlungsdaten konnten nicht geladen werden."],
  "Payment failed. {m}": ["決済に失敗しました。{m}", "支付失败。{m}", "El pago falló. {m}", "O pagamento falhou. {m}", "Le paiement a échoué. {m}", "Zahlung fehlgeschlagen. {m}"],
  "Your payment went through, but we couldn't activate the subscription. Please contact support.": ["決済は完了しましたが、サブスクリプションを有効にできませんでした。サポートまでご連絡ください。", "扣款已完成，但订阅未能开通，请联系客服。", "El pago se realizó, pero no pudimos activar la suscripción. Contacta con soporte.", "O pagamento foi efetuado, mas não conseguimos ativar a subscrição. Contacte o apoio ao cliente.", "Le paiement a abouti, mais l'abonnement n'a pas pu être activé. Contactez le support.", "Die Zahlung war erfolgreich, das Abonnement konnte aber nicht aktiviert werden. Bitte kontaktieren Sie den Support."],
  "Payment was canceled.": ["決済画面でキャンセルされました。", "已在支付窗口取消。", "El pago se canceló.", "O pagamento foi cancelado.", "Le paiement a été annulé.", "Die Zahlung wurde abgebrochen."],
  "Something went wrong while processing your payment.": ["決済処理中にエラーが発生しました。", "支付处理过程中出现错误。", "Se produjo un error al procesar tu pago.", "Ocorreu um erro ao processar o seu pagamento.", "Une erreur s'est produite lors du traitement de votre paiement.", "Bei der Verarbeitung Ihrer Zahlung ist ein Fehler aufgetreten."],
  "Can't continue to checkout": ["決済に進めません", "无法继续支付", "No se puede continuar con el pago", "Não é possível continuar para o pagamento", "Impossible de poursuivre le paiement", "Zahlung kann nicht fortgesetzt werden"],
  "Your subscription is active": ["サブスクリプションを開始しました", "订阅已开通", "Tu suscripción está activa", "A sua subscrição está ativa", "Votre abonnement est actif", "Ihr Abonnement ist aktiv"],
  "Close this window and return to the app — your plan is already applied.": ["この画面を閉じてアプリに戻ると、プランが適用されています。", "关闭此窗口并返回应用，套餐已生效。", "Cierra esta ventana y vuelve a la aplicación: tu plan ya está aplicado.", "Feche esta janela e regresse à aplicação — o seu plano já está aplicado.", "Fermez cette fenêtre et revenez à l'application — votre formule est déjà appliquée.", "Schließen Sie dieses Fenster und kehren Sie zur App zurück — Ihr Tarif ist bereits aktiv."],
  "Close window": ["画面を閉じる", "关闭窗口", "Cerrar ventana", "Fechar janela", "Fermer la fenêtre", "Fenster schließen"],
  "Recurring payment": ["定期購入", "定期扣款", "Pago recurrente", "Pagamento recorrente", "Paiement récurrent", "Wiederkehrende Zahlung"],
  "Subscription": ["ご利用料金", "订阅费", "Cuota de suscripción", "Mensalidade", "Abonnement", "Abogebühr"],
  "VAT (10%)": ["消費税 (10%)", "增值税 (10%)", "IVA (10 %)", "IVA (10 %)", "TVA (10 %)", "MwSt. (10 %)"],
  "Credit card": ["クレジットカード", "信用卡", "Tarjeta de crédito", "Cartão de crédito", "Carte bancaire", "Kreditkarte"],
  "Credit card (Korea)": ["クレジットカード（韓国）", "信用卡（韩国）", "Tarjeta de crédito (Corea)", "Cartão de crédito (Coreia)", "Carte bancaire (Corée)", "Kreditkarte (Korea)"],
  " — I agree.": ["に同意します。", "，我同意。", " — Acepto.", " — Aceito.", " — J'accepte.", " — Ich stimme zu."],
  "Read the full terms & privacy policy": ["利用規約・プライバシーポリシー全文を読む", "查看完整服务条款与隐私政策", "Leer los términos y la política de privacidad completos", "Ler os termos e a política de privacidade na íntegra", "Lire l'intégralité des conditions et de la politique de confidentialité", "Vollständige Bedingungen und Datenschutzerklärung lesen"],
  "Pay {amt} and subscribe": ["{amt} を支払って登録する", "支付 {amt} 并开始订阅", "Pagar {amt} y suscribirse", "Pagar {amt} e subscrever", "Payer {amt} et s'abonner", "{amt} zahlen und abonnieren"],
  "{plan} subscription": ["{plan} サブスクリプション", "{plan} 订阅", "Suscripción {plan}", "Subscrição {plan}", "Abonnement {plan}", "{plan}-Abonnement"],

  // ── 문의·바닥글 ────────────────────────────────────────────────────────
  "For service-related inquiries, please write to us at:": ["サービスに関するお問い合わせは、こちらまでご連絡ください。", "有关服务的咨询，请发送邮件至：", "Para consultas sobre el servicio, escríbenos a:", "Para questões sobre o serviço, escreva-nos para:", "Pour toute question sur le service, écrivez-nous à :", "Bei Fragen zum Dienst schreiben Sie uns an:"],
  "Company: MassLabs | Representative: Baek Jonghwi | Business Reg. No.: 895-34-01789": ["商号: MassLabs | 代表者: Baek Jonghwi | 事業者登録番号: 895-34-01789", "公司名称：MassLabs | 代表人：Baek Jonghwi | 营业执照号：895-34-01789", "Empresa: MassLabs | Representante: Baek Jonghwi | N.º de registro mercantil: 895-34-01789", "Empresa: MassLabs | Representante: Baek Jonghwi | N.º de registo comercial: 895-34-01789", "Société : MassLabs | Représentant : Baek Jonghwi | N° d'enregistrement : 895-34-01789", "Firma: MassLabs | Vertreter: Baek Jonghwi | Handelsregister-Nr.: 895-34-01789"],
  "Address: 12 Jeongnungaro 8ga-gil, Seongbuk-gu, Seoul, Korea, #401 | Phone: 070-8144-5867 | Email: masslabs.archi@gmail.com": ["住所: 12 Jeongnungaro 8ga-gil, Seongbuk-gu, Seoul, Korea, #401 | 電話: 070-8144-5867 | メール: masslabs.archi@gmail.com", "地址：12 Jeongnungaro 8ga-gil, Seongbuk-gu, Seoul, Korea, #401 | 电话：070-8144-5867 | 邮箱：masslabs.archi@gmail.com", "Dirección: 12 Jeongnungaro 8ga-gil, Seongbuk-gu, Seúl, Corea, #401 | Teléfono: 070-8144-5867 | Correo: masslabs.archi@gmail.com", "Morada: 12 Jeongnungaro 8ga-gil, Seongbuk-gu, Seul, Coreia, #401 | Telefone: 070-8144-5867 | E-mail: masslabs.archi@gmail.com", "Adresse : 12 Jeongnungaro 8ga-gil, Seongbuk-gu, Séoul, Corée, #401 | Téléphone : 070-8144-5867 | E-mail : masslabs.archi@gmail.com", "Adresse: 12 Jeongnungaro 8ga-gil, Seongbuk-gu, Seoul, Korea, #401 | Telefon: 070-8144-5867 | E-Mail: masslabs.archi@gmail.com"],
};

// 열쇠 하나에 언어 여섯 — 화면이 쓰는 모양(언어별 표)으로 뒤집는다.
//   이 한 번의 뒤집기 덕분에 위 표는 **줄 하나에 문장 하나**로 읽힌다.
//   ⛔번역이 빠진 열쇠는 아예 넣지 않는다 — 빈 문자열을 넣으면 화면이 빈칸이 된다.
export const DICT: Partial<Record<Lang, Record<string, string>>> = (() => {
  const out: Partial<Record<Lang, Record<string, string>>> = {};
  ORDER.forEach((code, i) => {
    const table: Record<string, string> = {};
    for (const [en, six] of Object.entries(M)) {
      const v = six[i];
      if (v) table[en] = v;
    }
    out[code] = table;
  });
  return out;
})();
