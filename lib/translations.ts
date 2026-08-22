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
      effectiveDate: "Effective date: April 13, 2026",
      sections: [
        {
          title: "Article 1 (Purpose of Processing Personal Data)",
          body: "MassLabs (\"the Company\") processes personal data for the following purposes. Personal data will not be used for purposes other than those listed below, and if the purpose changes, the necessary measures such as obtaining separate consent will be taken.",
          list: [
            "Payment processing: Service fee payment and refund handling",
            "Service analytics: Service improvement using user country information",
            "Data collection: Output data collected for refund verification and product improvement",
          ],
        },
        {
          title: "Article 2 (Categories of Personal Data Collected)",
          list: [
            "Payment information: Payment method details (sensitive data such as card numbers are processed through payment processors and never stored by the Company)",
            "Country information: The user's country of access",
            "Output data: Samples of flat-arranged pieces and material thickness",
          ],
          body2: "The Company does not collect email addresses, and there is no separate membership registration process.",
        },
        {
          title: "Article 3 (Retention and Use Period)",
          list: [
            "Payment records: Retained for 5 years in accordance with e-commerce regulations, then destroyed",
            "Country data: Retained in anonymized form after statistical processing",
            "Output data: Retained until consent is withdrawn, then immediately destroyed",
          ],
        },
        {
          title: "Article 4 (Delegation of Personal Data Processing)",
          body: "The Company delegates minimal information to payment processors including Galaxia Money Tree (Billgate) via PortOne for payment handling. Delegated companies are managed and supervised to process personal data safely in accordance with the Personal Information Protection Act.",
        },
        {
          title: "Article 5 (Provision to Third Parties)",
          body: "The Company does not, in principle, provide users' personal data to third parties. Exceptions apply when users have given prior consent or when required by law.",
        },
        {
          title: "Article 6 (User Rights)",
          body: "Users may request access, correction, deletion, or suspension of their personal data at any time. Consent to output data collection may also be withdrawn at any time. Please contact masslabs.archi@gmail.com for requests.",
        },
        {
          title: "Article 7 (Destruction of Personal Data)",
          body: "Personal data for which the retention period has elapsed or the processing purpose has been achieved will be destroyed without delay. Electronic files are permanently deleted in a manner that prevents recovery.",
        },
        {
          title: "Article 8 (Data Protection Officer)",
          body: "For inquiries regarding personal data processing, please contact: Representative: Baek Jonghwi | Email: masslabs.archi@gmail.com",
        },
        {
          title: "Article 9 (Remedies for Rights Infringement)",
          body: "You may contact the following organizations for remedies related to personal data infringement:",
          list: [
            "Personal Information Dispute Mediation Committee: 1833-6972 / www.kopico.go.kr",
            "Personal Information Infringement Report Center: 118 / privacy.kisa.or.kr",
            "Supreme Prosecutors’ Office: 1301 / www.spo.go.kr",
            "National Police Agency: 182 / ecrm.cyber.go.kr",
          ],
        },
        {
          title: "Article 10 (Changes to This Policy)",
          body: "This policy takes effect from the date of enforcement. Any changes will be announced at least 7 days in advance through the service screen.",
        },
      ],
    },
    terms: {
      back: "← Back",
      title: "Terms of Service",
      effectiveDate: "Effective date: August 19, 2026 (revised from the April 13, 2026 edition for the subscription service)",
      sections: [
        {
          title: "Article 1 (Purpose)",
          body: "These Terms govern the conditions and procedures for using the software subscription service (the Service) provided by MassLabs (the Company), and define the rights, obligations, and responsibilities of the Company and its users.",
        },
        {
          title: "Article 2 (Definitions)",
          body: "The terms used in these Terms are defined as follows.",
          list: [
            "Service — the subscription that gives an account access to the Company's programs, including programs that run in the browser (such as Archimap) and plug-ins that are downloaded and installed (such as LaserFish).",
            "User — a person who creates an account and uses the Service under these Terms",
            "Subscription — a monthly, automatically renewing right of use. Scope and limits differ by tier (PLUS, PRO, MAX).",
            "Credits — units that allow a set number of operations inside a program, granted monthly according to the tier",
          ],
        },
        {
          title: "Article 3 (Effect and Amendment of Terms)",
          body: "These Terms take effect upon posting on the service screen. The Company may amend the Terms within the scope permitted by applicable law, and will give notice of the effective date and reason at least 7 days in advance. For changes unfavorable to users, a grace period of at least 30 days will be given.",
        },
        {
          title: "Article 4 (Service Description)",
          body: "The Company provides programs for architectural and design work on a subscription basis.",
          list: [
            "A subscription belongs to an account, not to an individual program. One subscription covers the Company's programs together.",
            "Which programs are available and the limits that apply (maximum working range, monthly credits, and so on) depend on the tier, as shown on the pricing screen.",
            "The Company may add programs to the Service. Unless stated otherwise, added programs are included in existing subscriptions.",
          ],
        },
        {
          title: "Article 5 (Accounts and Devices)",
          body: "Users sign up with an email address or a Google account, and use that single account to sign in to every program the Company provides.",
          list: [
            "The Rhino plug-in may be used on one device at a time per account. Connecting a new device automatically disconnects the previous one.",
            "Users are responsible for keeping their account credentials safe and may not share, transfer, or resell them.",
          ],
        },
        {
          title: "Article 6 (System Requirements)",
          body: "The operating environment for each program (Rhino version, browser, and so on) is based on the specifications listed on that program's information screen. Operation in unlisted environments is not guaranteed, and the Company is not responsible for malfunctions caused by differences in the user's software environment.",
        },
        {
          title: "Article 7 (Formation of Agreement)",
          body: "The service agreement is formed when the user creates an account. A paid subscription agreement is formed when the user agrees to these Terms and registers a payment method, at which point the first subscription fee is charged.",
        },
        {
          title: "Article 8 (Fees and Payment)",
          body: "Subscription fees are those shown on the pricing screen.",
          list: [
            "Fees are charged automatically to the registered payment method on the same day each month and continue until the subscription is canceled.",
            "Amounts charged in Korea include 10% VAT. International payments are zero-rated, so no VAT is added.",
            "The Company may change subscription fees, giving at least 30 days' notice, with the change taking effect from the following billing cycle.",
            "If a payment fails, access may be suspended; updating the payment method and paying again restores access immediately.",
          ],
        },
        {
          title: "Article 9 (Cancellation)",
          body: "Users may cancel at any time from the My subscription screen.",
          list: [
            "After cancellation, no further charges are made from the next billing date, and access continues until the end of the period already paid for.",
            "If an all-access subscription is started while individual program subscriptions are active, those individual subscriptions are canceled immediately and merged into the all-access subscription; fees already paid for them are not refunded pro rata.",
          ],
        },
        {
          title: "Article 10 (Refunds)",
          body: "A subscription is a right to use digital content. Where the Service has been used after payment, withdrawal of subscription may be restricted under Article 17(2) of the Korean Act on Consumer Protection in Electronic Commerce. Refunds are nevertheless given in the following cases.",
          list: [
            "The Service was not used at all after payment and a refund is requested within 7 days of the payment date",
            "The Service could not be used normally for reasons attributable to the Company",
            "A duplicate or erroneous charge is confirmed",
          ],
          body2: "Send refund requests to masslabs.archi@gmail.com with the payment date, amount, and reason. Confirmed requests are processed within 3 to 5 business days.",
        },
        {
          title: "Article 11 (User Obligations)",
          body: "Users must comply with applicable laws and these Terms, and must not engage in the following:",
          list: [
            "Sharing, transferring, or reselling an account to third parties",
            "Reverse engineering, decompiling, or extracting the source code of the software",
            "Interfering with the stable operation of the Service, or circumventing usage limits by abnormal means",
            "Any other illegal or unauthorized acts",
          ],
        },
        {
          title: "Article 12 (Copyright)",
          body: "All copyrights to software and content within the Service belong to MassLabs. Users may use the Service for personal or business purposes for the duration of their subscription, and the rights to the work users create with the Service belong to the users.",
        },
        {
          title: "Article 13 (Disclaimer)",
          body: "The Company is not liable in the following cases:",
          list: [
            "Malfunctions caused by the user's modeling conditions, Rhino version, plug-in conflicts, or other user environment factors",
            "Service disruptions caused by reasons attributable to the user",
            "Service interruptions due to force majeure events such as natural disasters, war, or communication failures",
          ],
          body2: "However, if a program does not operate normally in the environment stated on its information screen, the Company will take corrective or refund measures.",
        },
        {
          title: "Article 14 (Dispute Resolution)",
          body: "If a dispute arises in connection with the Service, the Company and the user will negotiate in good faith toward an amicable resolution. Failing agreement, the laws of the Republic of Korea apply and jurisdiction follows applicable law.",
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
      effectiveDate: "시행일: 2026년 4월 13일",
      sections: [
        {
          title: "제1조 (개인정보의 처리 목적)",
          body: "MassLabs(이하 \"회사\")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하는 개인정보는 아래 목적 이외의 용도로 이용되지 않으며, 이용 목적이 변경될 경우 별도의 동의를 받는 등 필요한 조치를 이행합니다.",
          list: [
            "결제 처리: 서비스 이용료 결제 및 환불 처리",
            "서비스 통계 분석: 이용자 국가 정보를 활용한 서비스 개선",
            "데이터 수집: 환불요청 및 제품 수준 향상을 위한 결과물 데이터를 수집",
          ],
        },
        {
          title: "제2조 (수집하는 개인정보 항목)",
          list: [
            "결제 정보: 결제 수단 정보 (카드번호 등 민감정보는 결제 대행사를 통해 처리되며 회사가 직접 저장하지 않음)",
            "국가 정보: 이용자의 접속 국가",
            "결과물 데이터: 평면에 배치되는 조각들의 표본 및 재질 두께 수집",
          ],
          body2: "회사는 이메일 주소를 수집하지 않으며, 별도의 회원가입 절차가 없습니다.",
        },
        {
          title: "제3조 (개인정보의 보유 및 이용 기간)",
          list: [
            "결제 정보: 전자상거래법에 따라 5년간 보관 후 파기",
            "국가 정보: 통계 처리 후 개인 식별이 불가능한 형태로 보관",
            "결과물 데이터: 이용자가 동의를 철회하기 전까지 보관, 철회 시 지체 없이 파기",
          ],
        },
        {
          title: "제4조 (개인정보 처리의 위탁)",
          body: "회사는 결제 처리를 위해 포트원(PortOne)을 통해 갤럭시아머니트리(빌게이트) 등 결제 대행사에 최소한의 정보를 위탁합니다. 위탁받은 업체는 개인정보보호법에 따라 개인정보를 안전하게 처리하도록 관리·감독됩니다.",
        },
        {
          title: "제5조 (개인정보의 제3자 제공)",
          body: "회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우 또는 법령에 의한 요구가 있는 경우에는 예외로 합니다.",
        },
        {
          title: "제6조 (이용자의 권리)",
          body: "이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 결과물 데이터 수집에 대한 동의도 언제든지 철회할 수 있습니다. 요청은 masslabs.archi@gmail.com으로 문의해 주세요.",
        },
        {
          title: "제7조 (개인정보의 파기)",
          body: "보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복원이 불가능한 방법으로 영구 삭제합니다.",
        },
        {
          title: "제8조 (개인정보 보호책임자)",
          body: "개인정보 처리에 관한 문의는 아래 책임자에게 연락해 주세요.\n대표: 백종휘 | 이메일: masslabs.archi@gmail.com",
        },
        {
          title: "제9조 (권익침해 구제 방법)",
          body: "개인정보 침해로 인한 구제를 받기 위해 아래 기관에 문의하실 수 있습니다.",
          list: [
            "개인정보분쟁조정위원회: 1833-6972 / www.kopico.go.kr",
            "개인정보침해신고센터: 118 / privacy.kisa.or.kr",
            "대검찰청: 1301 / www.spo.go.kr",
            "경찰청: 182 / ecrm.cyber.go.kr",
          ],
        },
        {
          title: "제10조 (개인정보처리방침 변경)",
          body: "본 방침은 시행일로부터 적용되며, 변경 사항이 있을 경우 시행 7일 전부터 서비스 화면을 통해 고지합니다.",
        },
      ],
    },
    terms: {
      back: "← 뒤로",
      title: "이용약관",
      effectiveDate: "시행일: 2026년 8월 19일 (2026년 4월 13일 판을 구독 서비스 기준으로 개정)",
      sections: [
        {
          title: "제1조 (목적)",
          body: "본 약관은 MassLabs(이하 회사)가 제공하는 소프트웨어 구독 서비스(이하 서비스)의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
        },
        {
          title: "제2조 (정의)",
          body: "본 약관에서 사용하는 용어의 뜻은 다음과 같습니다.",
          list: [
            "서비스 — 회사가 제공하는 프로그램 전체를 계정 단위로 이용하게 하는 구독 서비스. 웹에서 실행되는 프로그램(Archimap 등)과 내려받아 설치하는 플러그인(LaserFish 등)을 포함합니다.",
            "이용자 — 계정을 만들고 본 약관에 따라 서비스를 이용하는 자",
            "구독 — 매월 자동으로 결제되는 이용권. 등급(PLUS·PRO·MAX)에 따라 이용 범위와 한도가 다릅니다.",
            "크레딧 — 프로그램 안에서 정해진 횟수만큼 기능을 사용할 수 있는 단위. 등급에 따라 매월 주어집니다.",
          ],
        },
        {
          title: "제3조 (약관의 효력 및 변경)",
          body: "본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자 및 변경 사유를 7일 이전부터 공지합니다. 이용자에게 불리한 변경의 경우 최소 30일 이상의 사전 유예기간을 둡니다.",
        },
        {
          title: "제4조 (서비스 내용)",
          body: "회사는 건축·설계 작업을 돕는 프로그램을 구독 형태로 제공합니다.",
          list: [
            "구독은 프로그램별이 아니라 계정 단위입니다. 하나의 구독으로 회사가 제공하는 프로그램을 함께 이용합니다.",
            "등급에 따라 이용할 수 있는 프로그램과 한도(최대 작업 범위, 월 크레딧 등)가 다르며, 그 기준은 요금제 화면에 표시된 내용에 따릅니다.",
            "회사는 서비스에 프로그램을 추가할 수 있으며, 추가된 프로그램은 별도 안내가 없는 한 기존 구독에 포함됩니다.",
          ],
        },
        {
          title: "제5조 (계정 및 기기)",
          body: "이용자는 이메일 또는 구글 계정으로 가입하며, 하나의 계정으로 회사가 제공하는 모든 프로그램에 로그인합니다.",
          list: [
            "라이노 플러그인은 계정당 동시 1대의 기기에서 사용할 수 있습니다. 새 기기를 연결하면 이전 기기의 연결은 자동으로 해제됩니다.",
            "계정 정보의 관리 책임은 이용자에게 있으며, 제3자와 공유하거나 양도할 수 없습니다.",
          ],
        },
        {
          title: "제6조 (동작 환경)",
          body: "각 프로그램의 동작 환경(라이노 버전, 브라우저 등)은 해당 프로그램의 안내 화면에 명시된 사양을 기준으로 합니다. 명시되지 않은 환경에서의 동작은 보장하지 않으며, 이용자의 소프트웨어 환경 차이로 인한 오작동에 대해 회사는 책임지지 않습니다.",
        },
        {
          title: "제7조 (이용계약의 성립)",
          body: "이용계약은 이용자가 계정을 만든 시점에 성립합니다. 유료 구독 계약은 이용자가 본 약관에 동의하고 결제수단을 등록한 시점에 성립하며, 이때 첫 구독료가 청구됩니다.",
        },
        {
          title: "제8조 (구독료 및 결제)",
          body: "구독료는 요금제 화면에 표시된 금액을 기준으로 합니다.",
          list: [
            "구독료는 등록된 결제수단으로 매월 같은 날 자동으로 청구되며, 해지 전까지 계속됩니다.",
            "국내 결제 금액에는 부가가치세 10%가 포함됩니다. 해외 결제는 영세율이 적용되어 부가가치세가 붙지 않습니다.",
            "회사는 구독료를 변경할 수 있으며, 변경 시 최소 30일 전에 공지하고 그 다음 결제 주기부터 적용합니다.",
            "결제가 실패한 경우 서비스 이용이 중지될 수 있으며, 결제수단을 갱신하여 다시 결제하면 즉시 복구됩니다.",
          ],
        },
        {
          title: "제9조 (해지)",
          body: "이용자는 언제든지 내 구독 화면에서 구독을 해지할 수 있습니다.",
          list: [
            "해지하면 다음 결제일부터 청구되지 않으며, 이미 결제한 기간이 끝날 때까지는 그대로 이용할 수 있습니다.",
            "이용 중인 개별 프로그램 구독이 있는 상태에서 전체 구독을 시작하면 기존 개별 구독은 즉시 해지되어 전체 구독으로 합쳐지며, 이미 결제된 개별 구독료는 일할 계산하여 환불되지 않습니다.",
          ],
        },
        {
          title: "제10조 (환불)",
          body: "구독은 디지털 콘텐츠 이용권으로, 결제 후 서비스를 이용한 경우 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항에 따라 청약철회가 제한될 수 있습니다. 다만 다음의 경우에는 환불해 드립니다.",
          list: [
            "결제 후 서비스를 전혀 이용하지 않았고, 결제일로부터 7일 이내에 요청한 경우",
            "회사의 귀책 사유로 서비스를 정상적으로 이용할 수 없었던 경우",
            "중복 결제 또는 오결제가 확인된 경우",
          ],
          body2: "환불 요청은 masslabs.archi@gmail.com으로 결제일·결제 금액·환불 사유를 적어 접수해 주세요. 확인 후 영업일 기준 3~5일 이내에 처리됩니다.",
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
          body: "서비스 내 모든 소프트웨어 및 콘텐츠의 저작권은 MassLabs에 귀속됩니다. 이용자는 구독 기간 동안 개인 또는 업무 목적으로 서비스를 이용할 수 있으며, 이용자가 서비스를 통해 만든 결과물의 권리는 이용자에게 있습니다.",
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
