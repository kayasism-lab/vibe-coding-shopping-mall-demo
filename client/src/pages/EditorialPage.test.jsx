import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../components/store/CartSidebar", () => ({ default: () => <div>cart</div> }));
vi.mock("../components/store/StoreFooter", () => ({ default: () => <div>footer</div> }));
vi.mock("../components/store/StoreHeader", () => ({ default: () => <div>header</div> }));
vi.mock("../context/ProductContext", () => ({
  useProducts: () => ({ products: [] }),
}));

const mockEditorials = [
  {
    slug: "minimalism-of-light",
    title: "미니멀리즘의 미학",
    label: "에디토리얼",
    status: "published",
    heroImage: "",
    heroImageAlt: "",
    intro: "",
    format: "manifesto",
    relatedProductSkus: [],
    eventBlocks: [],
    closingCtaLabel: "",
    closingCtaHref: "",
    manifestoSections: [],
    looks: [],
    processSections: [],
    galleryImages: [],
  },
  {
    slug: "spring-lookbook",
    title: "봄 룩북",
    label: "룩북",
    status: "published",
    heroImage: "https://example.com/spring-lookbook.jpg",
    heroImageAlt: "봄 룩북 대표 이미지",
    intro: "",
    format: "lookbook",
    relatedProductSkus: [],
    eventBlocks: [],
    closingCtaLabel: "",
    closingCtaHref: "",
    manifestoSections: [],
    looks: [],
    processSections: [],
    galleryImages: [],
  },
  {
    slug: "behind-the-story",
    title: "비하인드 스토리",
    label: "스튜디오",
    status: "published",
    heroImage: "",
    heroImageAlt: "",
    intro: "",
    format: "studio-story",
    relatedProductSkus: [],
    eventBlocks: [],
    closingCtaLabel: "",
    closingCtaHref: "",
    manifestoSections: [],
    looks: [],
    processSections: [],
    galleryImages: [],
  },
];

let activeEditorials = mockEditorials;

vi.mock("../context/EditorialContext", () => ({
  useEditorials: () => ({
    getEditorialBySlug: (slug) => activeEditorials.find((e) => e.slug === slug) ?? null,
    getHomeEditorials: () => activeEditorials,
    isLoading: false,
  }),
}));

import EditorialPage from "./EditorialPage";

const renderPage = (slug) =>
  render(
    <MemoryRouter initialEntries={[`/editorial/${slug}`]}>
      <Routes>
        <Route path="/editorial/:slug" element={<EditorialPage user={null} onLogout={vi.fn()} />} />
      </Routes>
    </MemoryRouter>
  );

afterEach(() => {
  activeEditorials = mockEditorials;
});

describe("EditorialPage — editorial-to-editorial navigation", () => {
  it("shows links to the other home editorials, excluding the current one", () => {
    renderPage("minimalism-of-light");

    const springLink = screen.getByRole("link", { name: /봄 룩북/ });
    expect(springLink).toHaveAttribute("href", "/editorial/spring-lookbook");

    const behindLink = screen.getByRole("link", { name: /비하인드 스토리/ });
    expect(behindLink).toHaveAttribute("href", "/editorial/behind-the-story");
  });

  it("renders the target editorial hero image inside the navigation card when available", () => {
    renderPage("minimalism-of-light");

    const springPreviewImage = screen.getByRole("img", { name: "봄 룩북 대표 이미지" });
    expect(springPreviewImage).toHaveAttribute("src", "https://example.com/spring-lookbook.jpg");
  });

  it("does not include the current editorial in the navigation", () => {
    renderPage("minimalism-of-light");

    const navSection = screen.getByRole("region", { name: "다른 에디토리얼" });
    const selfLinks = within(navSection)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/editorial/minimalism-of-light");
    expect(selfLinks).toHaveLength(0);
  });

  it("shows the nav section from a different editorial's perspective", () => {
    renderPage("spring-lookbook");

    expect(screen.getByRole("link", { name: /미니멀리즘의 미학/ })).toHaveAttribute(
      "href",
      "/editorial/minimalism-of-light"
    );
    expect(screen.getByRole("link", { name: /비하인드 스토리/ })).toHaveAttribute(
      "href",
      "/editorial/behind-the-story"
    );
  });

  it("hides the navigation when there are no other published editorials", () => {
    activeEditorials = [mockEditorials[0]];

    renderPage("minimalism-of-light");

    expect(screen.queryByRole("region", { name: "다른 에디토리얼" })).not.toBeInTheDocument();
  });
});
