import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ bypassCSP: true });
  await page.goto("https://github.com/topics/javascript");

  await page.click("text=Load more");
  await page.waitForFunction(() => {
    const repoCards = document.querySelectorAll("article.border");
    return repoCards.length > 20;
  });

  await page.waitForTimeout(1000);

  const repos = await page.$$eval("article.border", (repoCards) => {
    return repoCards.map((card) => {
      const toText = (element: HTMLElement) => {
        if (!element) return "";
        return element.innerText.trim();
      };

      const [user, repo] = Array.from(
        card.querySelectorAll("h3 a")
      ) as HTMLElement[];

      let stars_count: number | undefined;
      const stars_element = card.querySelector("#repo-stars-counter-star");
      if (stars_element) {
        stars_count = Number(
          stars_element.getAttribute("title")?.replace(/,/g, "")
        );
      }

      const description: HTMLElement | null =
        card.querySelector("div.px-3 > p + div");
      const topics = card.querySelectorAll("a.topic-tag");

      return {
        user: toText(user),
        repo: toText(repo),
        url: (repo as HTMLLinkElement).href,
        stars: stars_count,
        description: !description ? "" : toText(description),
        topics: Array.from(topics).map((t) => toText(t as HTMLElement)),
      };
    });
  });

  console.log("repos", repos);
  await browser.close();
}

main();
