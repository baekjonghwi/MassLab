export const t = {
  en: {
    footer: {
      businessInfo1: "Company: MassLabs | Representative: Baek Jonghwi | Business Reg. No.: 895-34-01789",
      // 🔴이메일은 PG 가맹점 심사 필수 항목이다(엑심베이 심사기준: "고객센터 전화번호, 이메일 등").
      //   ⚠️통신판매업신고번호가 아직 빠져 있다 — 신고 후 이 줄에 함께 적을 것.
      businessInfo2: "Address: 12 Jeongnungaro 8ga-gil, Seongbuk-gu, Seoul, Korea, #401 | Phone: 070-8144-5867 | Email: masslabs.archi@gmail.com",
      termsAndPolicy: "Terms and Policy",
      privacy: "Privacy",
    },
    payment: {
      title: "Complete Your Drawing",
      pieces: "Pieces",
      cost: "Cost",
      vat: "VAT (10%)",
      total: "Total",
      info1: "You only pay for what’s generated.",
      info2: "If any part fails, it won’t be charged.",
      emailLabel: "Email address",
      emailHint: "Enter your email to receive your receipt.",
      emailPlaceholder: "your@email.com",
      agreeText: "I agree to the",
      termsLink: "terms & policy",
      payBtn: "Pay",
      processing: "Processing...",
      emailError: "Please enter your email.",
      payError: "Payment was cancelled or failed. Please try again.",
      sysError: "An error occurred during payment. Please try again.",
    },
    paymentComplete: {
      verifying: "Verifying payment...",
      failTitle: "Payment Failed",
      failDesc: "Something went wrong during payment. Please try again.",
      successTitle: "Payment Complete!",
      thankYou: "Thank you for your purchase.",
      generating: "Please wait while your model is being generated.",
      loading: "Loading...",
    },
    review: {
      title: "Leave a Review",
      desc: "Upload a photo of your result and write a short review.",
      photoLabel: "Photo",
      photoPlaceholder: "Upload your result photo",
      nicknameLabel: "Nickname",
      nicknamePlaceholder: "Enter your nickname",
      reviewLabel: "Review",
      reviewPlaceholder: "Share your experience...",
      submit: "Submit Review",
      submitting: "Submitting...",
      successTitle: "Thank you!",
      successDesc: "Your review has been submitted. Thank you for your feedback.",
      errorDesc: "Something went wrong. Please try again.",
      skip: "Skip",
    },
    contact: {
      title: "Contact",
      inquiryText: "For service-related inquiries, reach out through either channel below.",
      gmailLabel: "Email us",
      instaLabel: "Instagram DM",
    },
    privacy: {
      back: "← Back",
      title: "Privacy Policy",
      effectiveDate: "Effective: August 22, 2026 (revising the April 13, 2026 edition for unified accounts and subscriptions)",
      sections: [
        {
          title: "Article 1 (Purpose of Processing Personal Data)",
          body: "MassLabs (the \"Company\") processes personal data for the purposes below. Data is not used for any purpose other than these, and if the purpose changes the Company will obtain separate consent and take any other measures required.",
          list: [
            "Account management: sign-up, sign-in, identity verification, and unified authentication across every program the Company provides",
            "Service delivery: determining plan tier, managing credits, and linking devices for the Rhino plug-in",
            "Payment processing: charging service fees, recurring billing, refunds, and sending receipts",
            "Customer support: receiving enquiries and communicating outcomes",
            "Service analytics: improving the service using country-level usage data",
            "Output data collection: verifying refund requests and improving product quality",
          ],
        },
        {
          title: "Article 2 (Categories of Personal Data Collected)",
          list: [
            "Account data: email address, password (stored one-way hashed), the account identifier supplied by Google if you signed up with Google, and display name",
            "Usage data: plan tier, credit usage, country of access, and whether the free trial has been used",
            "Payment data: payment channel, currency and amount, payment method label (e.g. card issuer), payment identifier, payment provider response records, and the billing key used for recurring charges",
            "Device linking data: device identifier, linking code, plug-in authentication token (stored one-way hashed), device name, and last-seen time",
            "Review data: nickname, attached photo, and review text (only if you submit a review)",
            "Output data: samples of the pieces laid out on the plane and the material thickness",
            "Automatically generated data: service usage records and access timestamps",
          ],
          body2: "Sensitive payment details such as card number, expiry date, and password are handled by the payment provider and are never stored by the Company. A billing key stands in for card details and does not reveal the card number by itself.\nIf you only use pay-per-piece, you can pay without an account; in that case we collect only the email address used to send your receipt.",
        },
        {
          title: "Article 3 (Retention and Use Period)",
          list: [
            "Account data: retained until you close your account, then destroyed without delay",
            "Payment and subscription data: retained for 5 years under the Act on Consumer Protection in Electronic Commerce, then destroyed",
            "Device linking data: destroyed when the device is unlinked or the account is closed. Device linking codes expire automatically 10 minutes after issue",
            "Review data: retained until you request its deletion",
            "Output data: retained until you withdraw consent, then destroyed without delay",
            "Country of access: retained in a form that cannot identify an individual once aggregated",
          ],
        },
        {
          title: "Article 4 (Delegation of Personal Data Processing)",
          body: "The Company delegates personal data processing as set out below in order to provide the service. Each processor is supervised so that personal data is handled safely in accordance with the Personal Information Protection Act.",
          list: [
            "Supabase Inc. — account authentication, database and file storage",
            "Vercel Inc. — service hosting and operation",
            "Korea PortOne Inc. — payment routing",
            "Galaxia Money Tree Inc. — domestic payment processing",
            "Eximbay Co., Ltd. — international payment processing",
          ],
        },
        {
          title: "Article 5 (Use of Cookies)",
          body: "The Company uses cookies to keep you signed in. These cookies are shared by masslabs-archi.com and its subdomains, so signing in once keeps you signed in across every program the Company provides.\nYou may refuse cookies in your browser settings. If you do, you will not be able to use services that require signing in.",
        },
        {
          title: "Article 6 (Provision to Third Parties)",
          body: "As a rule the Company does not provide your personal data to third parties. Exceptions apply only where you have given prior consent or where disclosure is required by law.",
        },
        {
          title: "Article 7 (User Rights)",
          body: "You may at any time request access to, correction of, deletion of, or suspension of processing of your personal data, and you may close your account. You may also withdraw consent to output data collection at any time. Send requests to masslabs.archi@gmail.com and we will act on them within 10 business days.",
        },
        {
          title: "Article 8 (Destruction of Personal Data)",
          body: "Personal data whose retention period has passed or whose purpose has been fulfilled is destroyed without delay. Electronic files are permanently deleted by a method that makes recovery impossible.",
        },
        {
          title: "Article 9 (Security Measures)",
          list: [
            "Passwords and plug-in authentication tokens are stored one-way hashed; the originals are never kept.",
            "All communication between you and the Company is encrypted with HTTPS.",
            "Row-level security (RLS) is applied to the database so that you can only reach your own records.",
            "The number of people who handle personal data is kept to a minimum.",
          ],
        },
        {
          title: "Article 10 (Data Protection Officer)",
          body: "For enquiries about personal data processing, please contact:\nRepresentative: Baek Jonghwi | Email: masslabs.archi@gmail.com",
        },
        {
          title: "Article 11 (Remedies for Rights Infringement)",
          body: "You may contact the following bodies for relief from personal data infringement.",
          list: [
            "Personal Information Dispute Mediation Committee: 1833-6972 / www.kopico.go.kr",
            "Privacy Infringement Report Center: 118 / privacy.kisa.or.kr",
            "Supreme Prosecutors' Office: 1301 / www.spo.go.kr",
            "National Police Agency: 182 / ecrm.cyber.go.kr",
          ],
        },
        {
          title: "Article 12 (Changes to This Policy)",
          body: "This policy applies from its effective date. If it changes, notice will be given on the service at least 7 days before the change takes effect.",
        },
      ],
    },
    terms: {
      back: "← Back",
      title: "Terms and Refund Policy",
      effectiveDate: "Effective: August 22, 2026 (revising the August 19, 2026 edition to cover pay-per-piece)",
      sections: [
        {
          title: "Article 1 (Purpose)",
          body: "These Terms set out the conditions and procedures for using the software service (the \"Service\") provided by MassLabs (the \"Company\"), together with the rights, obligations, and responsibilities of the Company and the user.",
        },
        {
          title: "Article 2 (Definitions)",
          body: "The terms used in these Terms have the following meanings.",
          list: [
            "Service — every program the Company provides, including programs that run in the browser (such as Archi Map) and plug-ins you download and install (such as LaserFish).",
            "User — a person who uses the Service under these Terms",
            "Pay-per-piece — paying each time, based on the number of pieces generated. No account is required.",
            "Subscription — a monthly recurring plan. Scope and limits differ by tier (PLUS, PRO, MAX).",
            "Credits — units that allow a set number of operations inside a program, granted monthly according to your tier.",
          ],
        },
        {
          title: "Article 3 (Effect and Amendment of Terms)",
          body: "These Terms take effect when posted on the Service. The Company may amend them within the bounds of applicable law, giving notice of the effective date and reason at least 7 days in advance. Where an amendment is unfavourable to users, at least 30 days' advance notice is given.",
        },
        {
          title: "Article 4 (Service Description and How It Is Sold)",
          body: "The Company provides programs that assist architectural and design work, and charges for them in the two ways below. Which of them is available is determined by what is shown on the pricing screen.",
          list: [
            "Pay-per-piece — you pay according to the number of pieces LaserFish generates. Pieces that fail to generate because of an error are never charged.",
            "Subscription — billed monthly per account. One subscription covers the programs the Company provides. The programs and limits available (maximum working extent, monthly credits, and so on) differ by tier.",
          ],
          body2: "The Company may add programs to the Service; unless stated otherwise, added programs are included in existing subscriptions. The products and prices actually on sale are limited to those shown on the pricing screen.",
        },
        {
          title: "Article 5 (Accounts)",
          body: "You sign up with an email address or a Google account, and a single account signs you in to every program the Company provides. If you only use pay-per-piece, you do not need to create an account.",
          list: [
            "You are responsible for managing your account credentials, and may not share or transfer them to a third party.",
          ],
        },
        {
          title: "Article 6 (System Requirements)",
          body: "The operating environment for each program (Rhino version, browser, and so on) is the specification stated on that program's information screen. Operation in environments not stated there is not guaranteed, and the Company is not responsible for malfunctions caused by differences in a user's software environment.",
        },
        {
          title: "Article 7 (Formation of Agreement)",
          list: [
            "The user agreement between you and the Company is formed when you create an account.",
            "For pay-per-piece, an agreement for that transaction is formed when you complete payment. No account is required; in that case we only take the email address used to send your receipt.",
            "A paid subscription agreement is formed when you accept these Terms and register a payment method, at which point the first subscription fee is charged.",
          ],
        },
        {
          title: "Article 8 (Fees and Payment)",
          body: "Fees are the amounts shown on the pricing screen.",
          list: [
            "Pay-per-piece is charged once, at the amount displayed at the time of payment. Minimum and maximum order amounts apply as stated on the pricing screen.",
            "Subscription fees are charged automatically to your registered payment method on the same day each month and continue until you cancel.",
            "Payments made in the Republic of Korea include 10% VAT. Payments made outside the Republic of Korea are zero-rated, so no VAT is added.",
            "Payments are processed through payment providers designated by the Company, and the available payment methods are limited to those shown on the payment screen.",
            "The Company may change its fees, giving at least 30 days' notice; changes apply from the following billing cycle.",
            "If a subscription payment fails, service may be suspended; updating your payment method and paying again restores it immediately.",
          ],
        },
        {
          title: "Article 9 (Cancellation)",
          body: "You may cancel your subscription at any time from the My Plan screen.",
          list: [
            "After cancelling you are not charged from the next billing date, and you keep access until the period you have already paid for ends.",
            "If you start an all-access subscription while individual program subscriptions are active, those individual subscriptions are cancelled immediately and merged into the all-access subscription; fees already paid for them are not refunded pro rata.",
            "Pay-per-piece agreements end with each transaction, so there is nothing to cancel.",
          ],
        },
        {
          title: "Article 10 (Refunds)",
          body: "The Service is digital content, so once you have used it after payment, withdrawal of subscription may be restricted under Article 17(2) of the Act on Consumer Protection in Electronic Commerce. We will nevertheless issue a refund in the following cases.",
          list: [
            "The Service was not used at all after payment and a refund is requested within 7 days of the payment date",
            "The Service could not be used normally due to reasons attributable to the Company",
            "A duplicate or erroneous payment is confirmed",
          ],
          body2: "For pay-per-piece, pieces that fail to generate because of an error are never charged in the first place.\nSend refund requests to masslabs.archi@gmail.com with the payment date, amount, and reason. Confirmed requests are processed within 3 to 5 business days.",
        },
        {
          title: "Article 11 (User Obligations)",
          body: "You must comply with applicable law and these Terms when using the Service, and must not do any of the following.",
          list: [
            "Share, transfer, or resell your account to a third party",
            "Reverse engineer, decompile, or extract the source of the software",
            "Interfere with stable operation of the Service or circumvent usage limits by abnormal means",
            "Any other unlawful or improper act",
          ],
        },
        {
          title: "Article 12 (Copyright)",
          body: "Copyright in all software and content within the Service belongs to MassLabs. You may use the Service for personal or business purposes for the duration of your access, and you own the rights to whatever you create through the Service.",
        },
        {
          title: "Article 13 (Disclaimer)",
          body: "The Company is not responsible in the following cases.",
          list: [
            "Malfunctions caused by the user's environment, such as modelling condition, Rhino version, or plug-in conflicts",
            "Service disruption caused by reasons attributable to the user",
            "Service interruption due to force majeure such as natural disaster, war, or network failure",
          ],
          body2: "However, if a program does not operate normally in the environment stated on its information screen, the Company will take corrective or refund measures.",
        },
        {
          title: "Article 14 (Dispute Resolution)",
          body: "If a dispute arises in connection with the Service, the Company and the user will consult in good faith to resolve it amicably. Failing agreement, the laws of the Republic of Korea apply and jurisdiction follows applicable law.",
        },
        {
          title: "Article 15 (Miscellaneous)",
          body: "Matters not specified in these Terms follow the Act on Consumer Protection in Electronic Commerce, the Act on the Regulation of Terms and Conditions, and other applicable laws.",
        },
      ],
    },
  },

  ko: {
    footer: {
      businessInfo1: "상호명: MassLabs | 대표자: 백종휘 | 사업자등록번호: 895-34-01789",
      // 🔴이메일은 PG 가맹점 심사 필수 항목이다(엑심베이 심사기준: "고객센터 전화번호, 이메일 등").
      //   ⚠️통신판매업신고번호가 아직 빠져 있다 — 신고 후 이 줄에 함께 적을 것.
      businessInfo2: "주소: 서울특별시 성북구 정릉로8가길 12, 401호 | 전화: 070-8144-5867 | 이메일: masslabs.archi@gmail.com",
      termsAndPolicy: "이용약관 및 환불정책",
      privacy: "개인정보처리방침",
    },
    payment: {
      title: "도면 완성하기",
      pieces: "조각 수",
      cost: "비용",
      vat: "부가세 (10%)",
      total: "합계",
      info1: "생성된 결과물에 대해서만 결제됩니다.",
      info2: "오류가 발생한 부분은 청구되지 않습니다.",
      emailLabel: "이메일 주소",
      emailHint: "영수증을 받을 이메일을 입력하세요.",
      emailPlaceholder: "your@email.com",
      agreeText: "다음에 동의합니다:",
      termsLink: "이용약관 및 정책",
      payBtn: "결제하기",
      processing: "처리 중...",
      emailError: "이메일을 입력해 주세요.",
      payError: "결제가 취소되었거나 실패했습니다. 다시 시도해 주세요.",
      sysError: "결제 중 오류가 발생했습니다. 다시 시도해 주세요.",
    },
    paymentComplete: {
      verifying: "결제 확인 중...",
      failTitle: "결제 실패",
      failDesc: "결제 처리 중 문제가 발생했습니다. 다시 시도해 주세요.",
      successTitle: "결제가 완료되었습니다.",
      thankYou: "구매해 주셔서 감사합니다.",
      generating: "잠시만 기다려주시면 형상이 생성됩니다.",
      loading: "로딩 중...",
    },
    review: {
      title: "후기 작성",
      desc: "결과물이 나온 사진을 넣고, 간단한 후기를 작성해주세요.",
      photoLabel: "사진",
      photoPlaceholder: "결과물 사진을 업로드하세요",
      nicknameLabel: "닉네임",
      nicknamePlaceholder: "닉네임을 입력하세요",
      reviewLabel: "후기",
      reviewPlaceholder: "사용 후기를 남겨주세요...",
      submit: "후기 제출",
      submitting: "제출 중...",
      successTitle: "감사합니다!",
      successDesc: "후기가 접수되었습니다. 소중한 의견 감사합니다.",
      errorDesc: "오류가 발생했습니다. 다시 시도해 주세요.",
      skip: "건너뛰기",
    },
    contact: {
      title: "문의",
      inquiryText: "서비스 이용 관련 문의는 아래 두 가지 방법 중 편한 곳으로 연락해 주세요.",
      gmailLabel: "Gmail로 문의",
      instaLabel: "Instagram DM",
    },
    privacy: {
      back: "← 뒤로",
      title: "개인정보처리방침",
      effectiveDate: "시행일: 2026년 8월 22일 (2026년 4월 13일 판을 통합 계정·구독 기준으로 개정)",
      sections: [
        {
          title: "제1조 (개인정보의 처리 목적)",
          body: "MassLabs(이하 \"회사\")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하는 개인정보는 아래 목적 이외의 용도로 이용되지 않으며, 이용 목적이 변경될 경우 별도의 동의를 받는 등 필요한 조치를 이행합니다.",
          list: [
            "계정 관리: 회원 가입·로그인·본인 확인, 회사가 제공하는 프로그램 전체에 대한 통합 인증",
            "서비스 제공: 이용 등급 판정, 크레딧 관리, 라이노 플러그인의 기기 연결",
            "결제 처리: 서비스 이용료 결제·정기결제·환불 처리 및 영수증 발송",
            "고객 응대: 문의 접수 및 처리 결과 안내",
            "서비스 통계 분석: 이용자 국가 정보를 활용한 서비스 개선",
            "결과물 데이터 수집: 환불 요청 확인 및 제품 수준 향상",
          ],
        },
        {
          title: "제2조 (수집하는 개인정보 항목)",
          list: [
            "계정 정보: 이메일 주소, 비밀번호(단방향 암호화하여 저장), 구글 계정으로 가입한 경우 구글이 제공하는 계정 식별자, 표시 이름",
            "이용 정보: 이용 등급, 크레딧 사용량, 접속 국가, 무료 체험 사용 여부",
            "결제 정보: 결제 채널, 결제 통화 및 금액, 결제수단 표시명(예: 카드사명), 결제 식별자, 결제 대행사 응답 기록, 정기결제를 위한 빌링키",
            "기기 연결 정보: 기기 식별자, 연결 코드, 플러그인 인증 토큰(단방향 암호화하여 저장), 기기 이름, 마지막 접속 시각",
            "후기 정보: 닉네임, 첨부 사진, 후기 내용 (후기를 남기는 경우에 한합니다)",
            "결과물 데이터: 평면에 배치되는 조각들의 표본 및 재질 두께",
            "자동 생성 정보: 서비스 이용 기록, 접속 일시",
          ],
          body2: "카드번호·유효기간·비밀번호 등 결제수단의 민감한 정보는 결제 대행사가 처리하며 회사는 저장하지 않습니다. 빌링키는 카드 정보를 대신하는 값으로, 그 자체로는 카드번호를 알 수 없습니다.\n건당 결제만 이용하는 경우에는 계정 없이 결제할 수 있으며, 이때는 영수증을 받을 이메일 주소만 수집합니다.",
        },
        {
          title: "제3조 (개인정보의 보유 및 이용 기간)",
          list: [
            "계정 정보: 회원 탈퇴 시까지 보관하며, 탈퇴 시 지체 없이 파기",
            "결제·구독 정보: 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 5년간 보관 후 파기",
            "기기 연결 정보: 연결이 해제되거나 회원이 탈퇴할 때 파기. 기기 연결 코드는 발급 후 10분이 지나면 자동으로 만료",
            "후기 정보: 이용자가 삭제를 요청할 때까지 보관",
            "결과물 데이터: 이용자가 동의를 철회하기 전까지 보관, 철회 시 지체 없이 파기",
            "접속 국가 정보: 통계 처리 후 개인을 식별할 수 없는 형태로 보관",
          ],
        },
        {
          title: "제4조 (개인정보 처리의 위탁)",
          body: "회사는 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다. 위탁받은 업체는 개인정보보호법에 따라 개인정보를 안전하게 처리하도록 관리·감독됩니다.",
          list: [
            "Supabase Inc. — 계정 인증, 데이터베이스 및 첨부파일 보관",
            "Vercel Inc. — 서비스 호스팅 및 운영",
            "(주)코리아포트원 — 결제 중계",
            "(주)갤럭시아머니트리 — 국내 결제 처리",
            "(주)엑심베이 — 해외 결제 처리",
          ],
        },
        {
          title: "제5조 (쿠키의 사용)",
          body: "회사는 로그인 상태를 유지하기 위해 쿠키를 사용합니다. 이 쿠키는 masslabs-archi.com 및 그 하위 도메인이 함께 사용하므로, 한 번 로그인하면 회사가 제공하는 모든 프로그램에서 로그인 상태가 유지됩니다.\n이용자는 브라우저 설정에서 쿠키 저장을 거부할 수 있습니다. 다만 이 경우 로그인이 필요한 서비스는 이용할 수 없습니다.",
        },
        {
          title: "제6조 (개인정보의 제3자 제공)",
          body: "회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우 또는 법령에 의한 요구가 있는 경우에는 예외로 합니다.",
        },
        {
          title: "제7조 (이용자의 권리)",
          body: "이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리 정지 및 회원 탈퇴를 요청할 수 있습니다. 결과물 데이터 수집에 대한 동의도 언제든지 철회할 수 있습니다. 요청은 masslabs.archi@gmail.com으로 접수해 주시면 영업일 기준 10일 이내에 처리합니다.",
        },
        {
          title: "제8조 (개인정보의 파기)",
          body: "보유 기간이 지났거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복원이 불가능한 방법으로 영구 삭제합니다.",
        },
        {
          title: "제9조 (개인정보의 안전성 확보 조치)",
          list: [
            "비밀번호와 플러그인 인증 토큰은 단방향 암호화하여 저장하며, 원문을 보관하지 않습니다.",
            "이용자와 회사 사이의 모든 통신은 HTTPS로 암호화합니다.",
            "데이터베이스에 행 단위 접근 제어(RLS)를 적용하여, 이용자가 자신의 정보에만 접근할 수 있도록 합니다.",
            "개인정보를 처리하는 인원을 최소한으로 제한합니다.",
          ],
        },
        {
          title: "제10조 (개인정보 보호책임자)",
          body: "개인정보 처리에 관한 문의는 아래 책임자에게 연락해 주세요.\n대표: 백종휘 | 이메일: masslabs.archi@gmail.com",
        },
        {
          title: "제11조 (권익침해 구제 방법)",
          body: "개인정보 침해로 인한 구제를 받기 위해 아래 기관에 문의하실 수 있습니다.",
          list: [
            "개인정보분쟁조정위원회: 1833-6972 / www.kopico.go.kr",
            "개인정보침해신고센터: 118 / privacy.kisa.or.kr",
            "대검찰청: 1301 / www.spo.go.kr",
            "경찰청: 182 / ecrm.cyber.go.kr",
          ],
        },
        {
          title: "제12조 (개인정보처리방침 변경)",
          body: "본 방침은 시행일부터 적용되며, 변경 사항이 있을 경우 시행 7일 전부터 서비스 화면을 통해 고지합니다.",
        },
      ],
    },
    terms: {
      back: "← 뒤로",
      title: "이용약관 및 환불정책",
      effectiveDate: "시행일: 2026년 8월 22일 (2026년 8월 19일 판에 건당 결제를 반영하여 개정)",
      sections: [
        {
          title: "제1조 (목적)",
          body: "본 약관은 MassLabs(이하 \"회사\")가 제공하는 소프트웨어 서비스(이하 \"서비스\")의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
        },
        {
          title: "제2조 (정의)",
          body: "본 약관에서 사용하는 용어의 뜻은 다음과 같습니다.",
          list: [
            "서비스 — 회사가 제공하는 프로그램 전체. 웹에서 실행되는 프로그램(Archi Map 등)과 내려받아 설치하는 플러그인(LaserFish 등)을 포함합니다.",
            "이용자 — 본 약관에 따라 서비스를 이용하는 자",
            "건당 결제 — 생성된 결과물의 수량에 따라 그때그때 값을 치르는 방식. 계정 없이도 이용할 수 있습니다.",
            "구독 — 매월 자동으로 결제되는 이용권. 등급(PLUS·PRO·MAX)에 따라 이용 범위와 한도가 다릅니다.",
            "크레딧 — 프로그램 안에서 정해진 횟수만큼 기능을 사용할 수 있는 단위. 등급에 따라 매월 주어집니다.",
          ],
        },
        {
          title: "제3조 (약관의 효력 및 변경)",
          body: "본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자 및 변경 사유를 7일 이전부터 공지합니다. 이용자에게 불리한 변경의 경우 최소 30일 이상의 사전 유예기간을 둡니다.",
        },
        {
          title: "제4조 (서비스 내용 및 판매 방식)",
          body: "회사는 건축·설계 작업을 돕는 프로그램을 제공하며, 아래 두 가지 방식으로 이용료를 받습니다. 어느 방식이 제공되는지는 요금제 화면에 표시된 내용에 따릅니다.",
          list: [
            "건당 결제 — LaserFish가 생성한 조각의 수량에 따라 결제합니다. 오류가 발생하여 생성되지 않은 부분은 청구하지 않습니다.",
            "구독 — 계정 단위로 매월 결제하며, 하나의 구독으로 회사가 제공하는 프로그램을 함께 이용합니다. 등급에 따라 이용할 수 있는 프로그램과 한도(최대 작업 범위, 월 크레딧 등)가 다릅니다.",
          ],
          body2: "회사는 서비스에 프로그램을 추가할 수 있으며, 추가된 프로그램은 별도 안내가 없는 한 기존 구독에 포함됩니다. 실제로 판매되는 상품과 금액은 요금제 화면에 표시된 것에 한합니다.",
        },
        {
          title: "제5조 (계정)",
          body: "이용자는 이메일 또는 구글 계정으로 가입하며, 하나의 계정으로 회사가 제공하는 모든 프로그램에 로그인합니다. 건당 결제만 이용하는 경우에는 계정을 만들지 않아도 됩니다.",
          list: [
            "계정 정보의 관리 책임은 이용자에게 있으며, 제3자와 공유하거나 양도할 수 없습니다.",
          ],
        },
        {
          title: "제6조 (동작 환경)",
          body: "각 프로그램의 동작 환경(라이노 버전, 브라우저 등)은 해당 프로그램의 안내 화면에 명시된 사양을 기준으로 합니다. 명시되지 않은 환경에서의 동작은 보장하지 않으며, 이용자의 소프트웨어 환경 차이로 인한 오작동에 대해 회사는 책임지지 않습니다.",
        },
        {
          title: "제7조 (이용계약의 성립)",
          list: [
            "계정을 만든 시점에 회사와 이용자 사이의 이용계약이 성립합니다.",
            "건당 결제는 이용자가 결제를 완료한 시점에 그 건에 대한 계약이 성립합니다. 계정이 없어도 이용할 수 있으며, 이때는 영수증을 받을 이메일 주소만 받습니다.",
            "유료 구독 계약은 이용자가 본 약관에 동의하고 결제수단을 등록한 시점에 성립하며, 이때 첫 구독료가 청구됩니다.",
          ],
        },
        {
          title: "제8조 (이용료 및 결제)",
          body: "이용료는 요금제 화면에 표시된 금액을 기준으로 합니다.",
          list: [
            "건당 결제는 결제 시점에 화면에 표시된 금액을 1회 청구합니다. 최소·최대 주문 금액이 있으며, 그 기준은 요금제 화면에 따릅니다.",
            "구독료는 등록된 결제수단으로 매월 같은 날 자동으로 청구되며, 해지 전까지 계속됩니다.",
            "대한민국에서 결제하는 경우 결제 금액에 부가가치세 10%가 포함됩니다. 대한민국 외의 국가에서 결제하는 경우에는 영세율이 적용되어 부가가치세가 붙지 않습니다.",
            "결제는 회사가 지정한 결제 대행사를 통해 처리되며, 이용할 수 있는 결제수단은 결제 화면에 표시된 것에 한합니다.",
            "회사는 이용료를 변경할 수 있으며, 변경 시 최소 30일 전에 공지하고 그 다음 결제 주기부터 적용합니다.",
            "구독 결제가 실패한 경우 서비스 이용이 중지될 수 있으며, 결제수단을 갱신하여 다시 결제하면 즉시 복구됩니다.",
          ],
        },
        {
          title: "제9조 (해지)",
          body: "이용자는 언제든지 [내 구독] 화면에서 구독을 해지할 수 있습니다.",
          list: [
            "해지하면 다음 결제일부터 청구되지 않으며, 이미 결제한 기간이 끝날 때까지는 그대로 이용할 수 있습니다.",
            "이용 중인 개별 프로그램 구독이 있는 상태에서 전체 구독을 시작하면 기존 개별 구독은 즉시 해지되어 전체 구독으로 합쳐지며, 이미 결제된 개별 구독료는 일할 계산하여 환불되지 않습니다.",
            "건당 결제는 회차마다 계약이 끝나므로 해지할 것이 없습니다.",
          ],
        },
        {
          title: "제10조 (환불)",
          body: "서비스는 디지털 콘텐츠 이용권으로, 결제 후 서비스를 이용한 경우 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항에 따라 청약철회가 제한될 수 있습니다. 다만 다음의 경우에는 환불해 드립니다.",
          list: [
            "결제 후 서비스를 전혀 이용하지 않았고, 결제일로부터 7일 이내에 요청한 경우",
            "회사의 귀책 사유로 서비스를 정상적으로 이용할 수 없었던 경우",
            "중복 결제 또는 오결제가 확인된 경우",
          ],
          body2: "건당 결제의 경우, 오류가 발생하여 생성되지 않은 조각은 애초에 청구하지 않습니다.\n환불 요청은 masslabs.archi@gmail.com으로 결제일·결제 금액·환불 사유를 적어 접수해 주세요. 확인 후 영업일 기준 3~5일 이내에 처리됩니다.",
        },
        {
          title: "제11조 (이용자의 의무)",
          body: "이용자는 서비스 이용 시 관계 법령 및 본 약관을 준수해야 하며, 다음 행위를 해서는 안 됩니다.",
          list: [
            "계정을 제3자와 공유하거나 양도·재판매하는 행위",
            "소프트웨어의 리버스 엔지니어링, 디컴파일, 소스 추출",
            "서비스의 안정적 운영을 방해하거나 비정상적인 방법으로 이용 한도를 우회하는 행위",
            "기타 불법적이거나 부당한 행위",
          ],
        },
        {
          title: "제12조 (저작권)",
          body: "서비스 내 모든 소프트웨어 및 콘텐츠의 저작권은 MassLabs에 귀속됩니다. 이용자는 이용 기간 동안 개인 또는 업무 목적으로 서비스를 이용할 수 있으며, 이용자가 서비스를 통해 만든 결과물의 권리는 이용자에게 있습니다.",
        },
        {
          title: "제13조 (면책조항)",
          body: "회사는 다음의 경우 책임을 지지 않습니다.",
          list: [
            "이용자의 모델링 상태, 라이노 버전, 플러그인 충돌 등 사용자 환경으로 인한 오작동",
            "이용자의 귀책 사유로 인한 서비스 이용 장애",
            "천재지변, 전쟁, 통신 장애 등 불가항력적 사유로 인한 서비스 중단",
          ],
          body2: "단, 안내 화면에 명시된 환경에서 정상 작동하지 않는 경우 회사가 수정 또는 환불 조치를 취합니다.",
        },
        {
          title: "제14조 (분쟁 해결)",
          body: "서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 이용자는 원만한 해결을 위해 성실히 협의합니다. 협의가 이루어지지 않는 경우 대한민국 법을 적용하며, 관할 법원은 관련 법령에 따릅니다.",
        },
        {
          title: "제15조 (기타)",
          body: "본 약관에 명시되지 않은 사항은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」 및 관련 법령에 따릅니다.",
        },
      ],
    },
  },
} as const;

export type Lang = keyof typeof t;
