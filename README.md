# Shuai Shao’s portfolio

A responsive academic portfolio for GitHub Pages. Includes research summaries, filterable publications, citation copying, teaching and research experience, machine learning expertise, contact links, and a printable academic CV. No installation or build step is needed.

## Preview

From this folder, run `python3 -m http.server 8000`, then open `http://localhost:8000`.

## Publish on GitHub Pages

The selected website address is **https://shuaishao88.github.io/**, with an academic research and publications focus.

Sign in to GitHub as **ShuaiShao88** and create a public repository named **ShuaiShao88.github.io**. Upload these files at its root, including `.github/workflows/pages.yml` and `.nojekyll`. The site is ready to publish without an installation or build step.

In the repository, open **Settings → Pages → Build and deployment**, and select **GitHub Actions** as the source. Push to `main` or run **Deploy portfolio to GitHub Pages** in the Actions tab. The included workflow handles deployment.

The existing `ShuaiShao88/shuaishao.github.io` repository has a different name. It does not provide the selected root address. Creating `ShuaiShao88.github.io` keeps that original repository intact. These address rules follow the [GitHub Pages quickstart](https://docs.github.com/en/pages/quickstart).

## Edit content

- `index.html`: biography, research descriptions, experience, teaching, machine learning expertise, education, and contact information.
- `data.js`: publications, statuses, links, and copyable citations.
- `cv.html`: the complete printable academic CV. Update its publication section when changing `data.js`.
- `styles.css`: colors, typography, responsive layout, and print styles.
- `assets/shuai-shao.jpg`: portrait.
- `robots.txt` and `sitemap.xml`: search engine discovery for the selected address.

The CV page’s **Download PDF** button saves `assets/Shuai_Shao_CV.pdf` directly. The PDF uses US Letter pages, generous margins, Times New Roman, and page numbers.

After changing CV content in `cv.html`, regenerate the PDF with `python3 scripts/build_cv_pdf.py` before publishing. The script requires ReportLab (`python3 -m pip install reportlab`). It embeds Times New Roman when the font is installed in the standard macOS location, and uses Times as a fallback on other systems. Review the regenerated PDF to check page breaks before publishing it.

## Visitor statistics

Cloudflare Web Analytics is installed on the homepage and CV page for `shuaishao88.github.io`. Sign into the Cloudflare dashboard, open **Web Analytics**, and select this site to see visits, page views, and traffic sources. It can take a few minutes for new visits to appear.

The `data-cf-beacon` value in each HTML page is a public site identifier from Cloudflare's **Manage site** installation snippet. If replacing it, update both pages. This tracks HTML page views; the PDF file itself does not run the analytics script.

## Content sources

The supplied `Shuai_Shao_Academic_CV.docx` provides the academic details and October 2026 publication statuses. The [UNC Charlotte profile](https://datasciencephd.charlotte.edu/shuai-shao/) provides the portrait, university email, and background. The portrait is stored locally so it does not depend on an external image request. Publication statuses remain explicit; in-press papers are not described as already published, and the special issue proposal is labeled as a proposal.

The design uses Times New Roman throughout, with Times and a generic serif as fallbacks. Text sizes are enlarged for readability on desktop and phone screens. No external font request is needed. Publication filters and citation copying use browser JavaScript.
