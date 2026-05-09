import { Link } from "react-router-dom";

export const Footer = () => {
  const sealId = "451010";
  const sealCode = "elivVMnN81AnBnmI1GZuXAjn4s4avRKQ";
  const sealUrl = `https://trustseal.enamad.ir/?id=${sealId}&Code=${sealCode}`;
  const imageUrl = `https://trustseal.enamad.ir/logo.aspx?id=${sealId}&Code=${sealCode}`;
  return (
    <footer className="footer-shell bg-color-for-layer-on-body">
      <div className="footer-wrapper sm:container mt-8 mx-auto px-4 py-4 lg:pb-12 lg:pt-4 relative">
        <div className="footer-highlights">
          <div className="footer-feature-item">
            <div className="relative">
              <span className="footer-feature-icon">
                <span>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 21.3359H28V26.6693C28 27.0229 27.8595 27.362 27.6095 27.6121C27.3594 27.8621 27.0203 28.0026 26.6667 28.0026H5.33333C4.97971 28.0026 4.64057 27.8621 4.39052 27.6121C4.14048 27.362 4 27.0229 4 26.6693V21.3359Z"
                      fill="#1b7efb"
                    />
                    <path
                      d="M4 10.6667L10.28 4.38667C10.5283 4.14034 10.8635 4.00147 11.2133 4H20.7867C21.1365 4.00147 21.4717 4.14034 21.72 4.38667L28 10.6667"
                      fill="#1b7efb"
                    />
                    <path
                      d="M4 10.6667L10.28 4.38667C10.5283 4.14034 10.8635 4.00147 11.2133 4H20.7867C21.1365 4.00147 21.4717 4.14034 21.72 4.38667L28 10.6667M4 10.6667H28M4 10.6667V26.6667C4 27.0203 4.14048 27.3594 4.39052 27.6095C4.64057 27.8595 4.97971 28 5.33333 28H26.6667C27.0203 28 27.3594 27.8595 27.6095 27.6095C27.8595 27.3594 28 27.0203 28 26.6667V10.6667M16 4V17.3333"
                      stroke="#1b7efb"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </div>
            <div className="footer-feature-content">
              <h5 className="font-s-sbold text-base first-text-color">
                ارسال رایگان کالا
              </h5>
              <p className="text-sm first-text-color-for-paragraph leading-7">
                به تمام نقاط کشور
              </p>
            </div>
          </div>
          <div className="footer-feature-item">
            <div className="relative">
              <span className="footer-feature-icon">
                <span>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M28 12C28 9.87827 27.1571 7.84344 25.6569 6.34315C24.1566 4.84286 22.1217 4 20 4"
                      stroke="#1b7efb"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M28.0005 20.0005V25.2405C28.0046 25.6258 27.9251 26.0073 27.7676 26.3589C27.6101 26.7105 27.3783 27.0238 27.0882 27.2772C26.798 27.5307 26.4563 27.7182 26.0867 27.8269C25.7171 27.9357 25.3284 27.9631 24.9472 27.9072C21.696 27.4888 18.565 26.4088 15.7472 24.7339C11.0383 20.4811 8.20505 14.5366 7.86719 8.20052C7.86719 7.8469 8.00766 7.50776 8.25771 7.25771C8.50776 7.00766 8.8469 6.86719 9.20052 6.86719H13.6139C13.8222 8.02705 14.1761 9.15598 14.6672 10.2272C14.7956 10.5272 14.8096 10.864 14.7064 11.1736C14.6032 11.4832 14.39 11.7442 14.1072 11.9072L12.9605 12.5605C12.7952 12.6514 12.6511 12.7764 12.5377 12.9271C12.4243 13.0778 12.3441 13.2509 12.3025 13.4349C12.261 13.6188 12.2589 13.8096 12.2965 13.9944C12.334 14.1793 12.4104 14.354 12.5205 14.5072C13.8396 16.4394 15.5083 18.1081 17.4405 19.4272C17.6776 19.5845 17.956 19.668 18.2405 19.6672C18.4745 19.6644 18.7037 19.6001 18.9049 19.4808C19.1062 19.3614 19.2725 19.1912 19.3872 18.9872L20.0405 17.8405C20.2132 17.554 20.4873 17.3429 20.8084 17.2491C21.1294 17.1552 21.4741 17.1855 21.7739 17.3339C23.3581 18.0829 25.0664 18.5349 26.8139 18.6672C27.1415 18.7034 27.4441 18.8598 27.6632 19.106C27.8824 19.3522 28.0025 19.6709 28.0005 20.0005Z"
                      fill="#1b7efb"
                    />
                    <path
                      d="M22.6664 12C22.6664 11.2928 22.3854 10.6145 21.8853 10.1144C21.3852 9.61433 20.707 9.33337 19.9997 9.33337M27.9997 20V25.24C28.0038 25.6253 27.9244 26.0068 27.7668 26.3584C27.6093 26.71 27.3775 27.0233 27.0874 27.2767C26.7972 27.5302 26.4555 27.7177 26.0859 27.8265C25.7163 27.9352 25.3276 27.9626 24.9464 27.9067C19.6623 27.2279 14.7543 24.8103 10.9957 21.0348C7.23705 17.2592 4.84146 12.3404 4.18639 7.05337C4.13069 6.67331 4.15775 6.28569 4.26573 5.91705C4.37371 5.54841 4.56006 5.20746 4.81202 4.91751C5.06398 4.62756 5.37561 4.39547 5.72558 4.23712C6.07555 4.07877 6.4556 3.9979 6.83973 4.00004H11.9997C12.3293 3.99804 12.648 4.11821 12.8942 4.33735C13.1405 4.5565 13.2968 4.85908 13.3331 5.18671C13.4654 6.93414 13.9173 8.64244 14.6664 10.2267C14.7948 10.5267 14.8088 10.8635 14.7056 11.1731C14.6024 11.4827 14.3892 11.7437 14.1064 11.9067L12.9597 12.56C12.7944 12.6509 12.6503 12.7759 12.5369 12.9266C12.4235 13.0773 12.3433 13.2504 12.3017 13.4344C12.2602 13.6184 12.2581 13.8091 12.2957 13.9939C12.3332 14.1788 12.4096 14.3536 12.5197 14.5067C13.8388 16.439 15.5075 18.1076 17.4397 19.4267C17.5929 19.5368 17.7676 19.6132 17.9525 19.6508C18.1373 19.6883 18.3281 19.6863 18.5121 19.6447C18.696 19.6031 18.8691 19.5229 19.0198 19.4095C19.1705 19.2961 19.2955 19.152 19.3864 18.9867L20.0397 17.84C20.2124 17.5536 20.4865 17.3424 20.8076 17.2486C21.1286 17.1547 21.4733 17.185 21.7731 17.3334C23.3573 18.0825 25.0656 18.5344 26.8131 18.6667C27.1407 18.703 27.4433 18.8593 27.6624 19.1055C27.8816 19.3517 28.0017 19.6704 27.9997 20Z"
                      stroke="#1b7efb"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </div>
            <div className="footer-feature-content">
              <h5 className="font-s-sbold text-base first-text-color">
                پشتیبانی 24 ساعته
              </h5>
              <p className="text-sm first-text-color-for-paragraph leading-7">
                کارشناسان ما پاسخگوی شما هستند
              </p>
            </div>
          </div>
          <div className="footer-feature-item">
            <div className="relative">
              <span className="footer-feature-icon">
                <span>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M26.6673 13.3353C25.7606 12.522 24.494 12.1486 23.5873 11.362C22.4673 10.3486 21.6807 8.38862 20.334 7.84195C18.9873 7.29529 17.454 8.33528 16.014 8.33528C14.574 8.33528 12.9873 7.32195 11.6807 7.84195C10.374 8.36195 9.54732 10.3353 8.42732 11.3486C7.50732 12.1353 6.24065 12.5086 5.33398 13.3353C5.41678 12.8366 5.4702 12.3335 5.49398 11.8286C5.48694 11.084 5.62742 10.3453 5.90732 9.65529C6.32326 9.14864 6.85962 8.75439 7.46732 8.50862C8.13746 8.19403 8.76474 7.79526 9.33398 7.32195C9.87343 6.78654 10.356 6.19673 10.774 5.56195C11.1006 4.93974 11.5715 4.40482 12.1473 4.00195C12.2707 3.97852 12.3973 3.97852 12.5207 4.00195C12.9746 4.04221 13.4222 4.1362 13.854 4.28195C14.5511 4.49381 15.2726 4.61481 16.0007 4.64195C16.7064 4.61032 17.4053 4.48936 18.0807 4.28195C18.6475 4.03869 19.2666 3.94238 19.8806 4.00195C20.4291 4.40157 20.884 4.91567 21.214 5.50862C21.6278 6.16645 22.1154 6.77485 22.6673 7.32195C23.233 7.78695 23.8504 8.18514 24.5073 8.50862C25.1146 8.7619 25.6536 9.15474 26.0806 9.65529C26.3422 10.3502 26.4777 11.0861 26.4807 11.8286C26.5473 12.282 26.5873 12.802 26.6673 13.3353Z"
                      fill="#1b7efb"
                    />
                    <path
                      d="M28.4925 15.9963C28.4925 17.3297 27.3459 18.383 26.9725 19.5563C26.5992 20.7297 26.8392 22.3297 26.1059 23.3297C25.3725 24.3297 23.7992 24.583 22.7725 25.3163C21.7459 26.0497 21.0659 27.4763 19.8659 27.8763C18.6659 28.2763 17.3325 27.5297 15.9992 27.5297C14.6659 27.5297 13.3325 28.263 12.1325 27.8897C10.9325 27.5163 10.2259 26.063 9.22586 25.3297C8.22586 24.5963 6.66586 24.3697 5.89253 23.343C5.11919 22.3163 5.42586 20.783 5.02586 19.5697C4.62586 18.3563 3.50586 17.3297 3.50586 15.9963C3.50586 14.663 4.65253 13.5963 5.02586 12.423C5.39919 11.2497 5.15919 9.64965 5.89253 8.64965C6.62586 7.64965 8.19919 7.40965 9.22586 6.66299C10.2525 5.91632 10.9325 4.51632 12.1325 4.11632C13.3325 3.71632 14.7059 4.47632 15.9992 4.47632C17.2925 4.47632 18.6659 3.74299 19.8659 4.11632C21.0659 4.48965 21.7725 5.94299 22.7725 6.66299C23.7725 7.38299 25.3592 7.62299 26.1059 8.64965C26.8525 9.67632 26.5725 11.2097 26.9725 12.423C27.3725 13.6363 28.4925 14.663 28.4925 15.9963Z"
                      stroke="#1b7efb"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.666 16.0026L14.666 20.0026L21.3327 13.3359"
                      stroke="#1b7efb"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </div>
            <div className="footer-feature-content">
              <h5 className="font-s-sbold text-base first-text-color">
                تضمین کیفیت کالا
              </h5>
              <p className="text-sm first-text-color-for-paragraph leading-7">
                کالاهای چک شده و تایید شده
              </p>
            </div>
          </div>
          <div className="footer-feature-item">
            <div className="relative">
              <span className="footer-feature-icon">
                <span>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.6667 9.33584V28.0025H6.66667C5.95942 28.0025 5.28115 27.7216 4.78105 27.2215C4.28095 26.7214 4 26.0431 4 25.3358V9.33584H10.6667ZM22.6667 9.33584L20.5733 5.13584C20.4184 4.83067 20.152 4.59679 19.8293 4.48262C19.5066 4.36845 19.1524 4.38273 18.84 4.52251L8 9.33584"
                      fill="#1b7efb"
                    />
                    <path
                      d="M26.6673 14.6641H22.6673C21.9309 14.6641 21.334 15.261 21.334 15.9974V18.6641C21.334 19.4004 21.9309 19.9974 22.6673 19.9974H26.6673C27.4037 19.9974 28.0007 19.4004 28.0007 18.6641V15.9974C28.0007 15.261 27.4037 14.6641 26.6673 14.6641Z"
                      fill="#1b7efb"
                    />
                    <path
                      d="M8 9.33584L18.84 4.52251C19.1524 4.38273 19.5066 4.36845 19.8293 4.48262C20.152 4.59679 20.4184 4.83067 20.5733 5.13584L22.6667 9.33584M26.6667 16.0025V10.6692C26.6667 10.3156 26.5262 9.97641 26.2761 9.72637C26.0261 9.47632 25.687 9.33584 25.3333 9.33584H5.33333C4.97971 9.33584 4.64057 9.47632 4.39052 9.72637C4.14048 9.97641 4 10.3156 4 10.6692V26.6692C4 27.0228 4.14048 27.3619 4.39052 27.612C4.64057 27.862 4.97971 28.0025 5.33333 28.0025H25.3333C25.687 28.0025 26.0261 27.862 26.2761 27.612C26.5262 27.3619 26.6667 27.0228 26.6667 26.6692V21.3358M26.6667 16.0025C27.0203 16.0025 27.3594 16.143 27.6095 16.393C27.8595 16.6431 28 16.9822 28 17.3358V20.0025C28 20.3561 27.8595 20.6953 27.6095 20.9453C27.3594 21.1954 27.0203 21.3358 26.6667 21.3358M26.6667 16.0025H22.6667C22.313 16.0025 21.9739 16.143 21.7239 16.393C21.4738 16.6431 21.3333 16.9822 21.3333 17.3358V20.0025C21.3333 20.3561 21.4738 20.6953 21.7239 20.9453C21.9739 21.1954 22.313 21.3358 22.6667 21.3358H26.6667"
                      stroke="#1b7efb"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </div>
            <div className="footer-feature-content">
              <h5 className="font-s-sbold text-base first-text-color">
                امکان پرداخت آنلاین
              </h5>
              <p className="text-sm first-text-color-for-paragraph leading-7">
                با درگاه اینترنتی کاملا امن
              </p>
            </div>
          </div>
        </div>
        <div className="footer-content-grid">
          <div className="footer-about-column">
            <h5 className="font-s-sbold text-base first-text-color">
              بهشت زیبایی پولک
            </h5>
            <ul className="mt-2">
              <li className="text-sm first-text-color-for-paragraph leading-7">
                میدونستی سالانه هزاران نفر بر اثر کالا های بی کیف زیبایی صورتشون
                رو از دست میدن پس شک نکن با فرشگاه بهشت زیبایی{" "}
               میتونی از این امر جلوگیری کنی پس
                با بهترین قیمت کالاتو همین الان سفارش بده
              </li>
            </ul>
          </div>
          <div className="footer-links-column">
            <h5 className="font-s-sbold text-base first-text-color">
              پشتیبانی
            </h5>
            <ul className="mt-2">
              <li className="footer-link-row group">
                <span className="footer-link-dot"></span>
                <Link
                  className="footer-link-anchor"
                  to="/about-us"
                >
                  درباره ما
                </Link>
              </li>
              <li className="footer-link-row group">
                <span className="footer-link-dot"></span>
                <Link
                  className="footer-link-anchor"
                  to="/contact-us"
                >
                  آدرس
                </Link>
              </li>
              <li className="footer-link-row group">
                <span className="footer-link-dot"></span>
                <Link
                  className="footer-link-anchor"
                  to="https://www.instagram.com/galery_pulak?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  اینستاگرام
                </Link>
              </li>
              <li className="footer-link-row group">
                <span className="footer-link-dot"></span>
                <a
                  href="tel:09392056442"
                  className="footer-link-anchor"
                >
                  09392056442
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-links-column">
            <h5 className="font-s-sbold text-base first-text-color">
              لینک های مفید
            </h5>
            <ul className="mt-2">
              <li className="footer-link-row group">
                <span className="footer-link-dot"></span>
                <Link
                  className="footer-link-anchor"
                  to="/faq"
                >
                  سوالات متداول
                </Link>
              </li>
              <li className="footer-link-row group">
                <span className="footer-link-dot"></span>
                <Link
                  className="footer-link-anchor"
                  to="/contact-us"
                >
                  تماس با ما
                </Link>
              </li>
              <li className="footer-link-row group">
                <span className="footer-link-dot"></span>
                <Link
                  className="footer-link-anchor"
                  to="/product-tracking"
                >
                  پیگیری کالا
                </Link>
              </li>
              <li className="footer-link-row group">
                <span className="footer-link-dot"></span>
                <Link
                  className="footer-link-anchor"
                  to="/return-policy"
                >
                  قوانین و مقررات
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-seal-column">
            <a
              className="footer-seal-link"
              href={sealUrl}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="origin"
            >
              <img
                className="footer-seal-image"
                src={imageUrl}
                alt="نماد اعتماد الکترونیکی"
                referrerPolicy="origin"
              />
            </a>
          </div>
        </div>
      </div>
      <p className="footer-copyright text-center text-sm first-text-color-for-paragraph">
        © 2025 فروشگاه زیبایی پولک - تمام حقوق محفوظ است.
      </p>
    </footer>
  );
};

