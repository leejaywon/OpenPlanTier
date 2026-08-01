"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  categories,
  projects,
  recipes,
  type CategoryId,
  type LicenseGroup,
  type Project,
} from "./projects";

type CategoryFilter = "all" | CategoryId;
type LicenseFilter = "all" | "permissive" | "copyleft";

const categoryLabels = new Map(categories.map((category) => [category.id, category.label]));

function triggerDownload(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function licenseLabel(group: LicenseGroup) {
  if (group === "permissive") return "Permissive";
  if (group === "weak-copyleft") return "Weak copyleft";
  return "Strong copyleft";
}

export function CatalogApp() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [licenseFilter, setLicenseFilter] = useState<LicenseFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const selectedProjects = useMemo(
    () => selectedIds.map((id) => projects.find((project) => project.id === id)).filter(Boolean) as Project[],
    [selectedIds],
  );

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesCategory = category === "all" || project.category === category;
      const matchesLicense =
        licenseFilter === "all" ||
        (licenseFilter === "permissive" && project.licenseGroup === "permissive") ||
        (licenseFilter === "copyleft" && project.licenseGroup !== "permissive");
      const searchable = [
        project.name,
        project.description,
        project.license,
        project.language,
        project.analogue,
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase();
      return matchesCategory && matchesLicense && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, licenseFilter, query]);

  const copyleftCount = selectedProjects.filter((project) => project.licenseGroup !== "permissive").length;

  function toggleProject(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((projectId) => projectId !== id) : [...current, id],
    );
  }

  function applyRecipe(projectIds: string[]) {
    setSelectedIds(projectIds);
    document.getElementById("builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function downloadManifest() {
    const manifest = {
      schemaVersion: 1,
      name: "openplantier-stack",
      generatedAt: new Date().toISOString(),
      projectCount: selectedProjects.length,
      projects: selectedProjects.map((project) => ({
        id: project.id,
        name: project.name,
        category: project.category,
        license: project.license,
        licenseGroup: project.licenseGroup,
        repository: project.repository,
        analogue: project.analogue,
      })),
    };
    triggerDownload("openplantier-stack.json", `${JSON.stringify(manifest, null, 2)}\n`, "application/json");
  }

  function downloadSourcesScript() {
    const cloneCommands = selectedProjects
      .map((project) => `git clone --depth=1 ${project.repository}.git ${project.id}`)
      .join("\n");
    const script = `#!/usr/bin/env bash
set -euo pipefail

mkdir -p openplantier-sources
cd openplantier-sources

${cloneCommands}

echo "Downloaded ${selectedProjects.length} projects to $(pwd)"
`;
    triggerDownload("download-openplantier-sources.sh", script, "text/x-shellscript");
  }

  async function copyStack() {
    const text = selectedProjects
      .map((project) => `${project.name} — ${project.license} — ${project.repository}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="OpenPlanTier home">
            <span className="brand-mark">O</span>
            <span>OpenPlanTier</span>
          </a>
          <nav className="nav-links" aria-label="Primary navigation">
            <a href="#catalog">Catalog</a>
            <a href="#builder">Stack builder</a>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </nav>
          <a className="header-stack" href="#builder">
            <span className="header-stack-count">{selectedProjects.length}</span>
            Stack
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="eyebrow"><span className="status-dot" /> Open-source platform index</div>
          <h1>Build your own<br />operating platform.</h1>
          <p>
            Find, compare, and combine the open-source building blocks behind a
            Palantir-like data, ontology, operations, and AI platform.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#catalog">Explore catalog</a>
            <a className="button button-secondary" href="#recipes">Start with a recipe</a>
          </div>
          <div className="hero-stats" aria-label="Catalog summary">
            <div><strong>{projects.length}</strong><span>Curated projects</span></div>
            <div><strong>{categories.length}</strong><span>Capability groups</span></div>
            <div><strong>100%</strong><span>Open source</span></div>
          </div>
        </section>

        <section className="recipes-section" id="recipes" aria-labelledby="recipes-title">
          <div className="section-heading compact-heading">
            <div>
              <span className="section-kicker">Quick start</span>
              <h2 id="recipes-title">Reference stacks</h2>
            </div>
            <p>Replace your current selection with a practical starting point.</p>
          </div>
          <div className="recipe-grid">
            {recipes.map((recipe, index) => (
              <button className="recipe-card" key={recipe.id} onClick={() => applyRecipe(recipe.projectIds)}>
                <span className="recipe-index">0{index + 1}</span>
                <span className="recipe-content">
                  <strong>{recipe.name}</strong>
                  <span>{recipe.description}</span>
                </span>
                <span className="recipe-meta">{recipe.projectIds.length} projects</span>
                <span className="recipe-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>

        <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Library archive</span>
              <h2 id="catalog-title">Open-source catalog</h2>
            </div>
            <p>Every entry includes its repository, license, and closest platform role.</p>
          </div>

          <div className="filter-panel">
            <label className="search-field">
              <span className="search-symbol" aria-hidden="true">⌕</span>
              <span className="sr-only">Search projects</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects, capabilities, licenses…"
              />
              <kbd>⌘ K</kbd>
            </label>
            <label className="select-field">
              <span className="sr-only">Filter by license</span>
              <select value={licenseFilter} onChange={(event) => setLicenseFilter(event.target.value as LicenseFilter)}>
                <option value="all">All licenses</option>
                <option value="permissive">Permissive only</option>
                <option value="copyleft">Copyleft</option>
              </select>
            </label>
          </div>

          <div className="category-tabs" role="group" aria-label="Filter by capability">
            <button
              className={category === "all" ? "active" : ""}
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
            >
              All <span>{projects.length}</span>
            </button>
            {categories.map((item) => {
              const count = projects.filter((project) => project.category === item.id).length;
              return (
                <button
                  className={category === item.id ? "active" : ""}
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  aria-pressed={category === item.id}
                >
                  {item.label} <span>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="catalog-layout" id="builder">
            <div className="project-results">
              <div className="results-bar">
                <span>{filteredProjects.length} projects</span>
                {(query || category !== "all" || licenseFilter !== "all") && (
                  <button onClick={() => { setQuery(""); setCategory("all"); setLicenseFilter("all"); }}>
                    Reset filters
                  </button>
                )}
              </div>

              <div className="project-grid">
                {filteredProjects.map((project) => {
                  const selected = selectedIds.includes(project.id);
                  return (
                    <article className={`project-card${selected ? " selected" : ""}`} key={project.id}>
                      <div className="project-card-top">
                        <div className="project-monogram" aria-hidden="true">{project.name.slice(0, 1)}</div>
                        <button
                          className="add-button"
                          onClick={() => toggleProject(project.id)}
                          aria-pressed={selected}
                          aria-label={`${selected ? "Remove" : "Add"} ${project.name} ${selected ? "from" : "to"} stack`}
                        >
                          {selected ? "Added" : "+ Add"}
                        </button>
                      </div>
                      <div className="project-title-row">
                        <h3>{project.name}</h3>
                        <a href={project.repository} target="_blank" rel="noreferrer" aria-label={`Open ${project.name} repository`}>
                          ↗
                        </a>
                      </div>
                      <p>{project.description}</p>
                      <div className="tag-list">
                        {project.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                      <div className="project-card-footer">
                        <span className={`license-badge ${project.licenseGroup}`} title={licenseLabel(project.licenseGroup)}>
                          <i aria-hidden="true" /> {project.license}
                        </span>
                        <span>{project.language}</span>
                      </div>
                      <div className="analogue-line">
                        <span>Maps to</span>
                        <strong>{project.analogue}</strong>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredProjects.length === 0 && (
                <div className="empty-state">
                  <strong>No projects found</strong>
                  <p>Try another capability, license, or search term.</p>
                  <button className="button button-secondary" onClick={() => { setQuery(""); setCategory("all"); setLicenseFilter("all"); }}>
                    Reset filters
                  </button>
                </div>
              )}
            </div>

            <aside className="stack-panel" aria-labelledby="stack-title">
              <div className="stack-panel-header">
                <div>
                  <span className="section-kicker">Your composition</span>
                  <h2 id="stack-title">Stack builder</h2>
                </div>
                {selectedProjects.length > 0 && <button className="text-button" onClick={() => setSelectedIds([])}>Clear</button>}
              </div>

              {selectedProjects.length === 0 ? (
                <div className="stack-empty">
                  <span className="stack-empty-icon">+</span>
                  <strong>Your stack is empty</strong>
                  <p>Add projects from the catalog or choose a reference stack above.</p>
                </div>
              ) : (
                <>
                  <div className="stack-list">
                    {selectedProjects.map((project, index) => (
                      <div className="stack-item" key={project.id}>
                        <span className="stack-number">{String(index + 1).padStart(2, "0")}</span>
                        <span className="stack-item-name">
                          <strong>{project.name}</strong>
                          <small>{categoryLabels.get(project.category)} · {project.license}</small>
                        </span>
                        <button onClick={() => toggleProject(project.id)} aria-label={`Remove ${project.name}`}>×</button>
                      </div>
                    ))}
                  </div>

                  <div className="stack-summary">
                    <div><span>Projects</span><strong>{selectedProjects.length}</strong></div>
                    <div><span>Capabilities</span><strong>{new Set(selectedProjects.map((project) => project.category)).size}</strong></div>
                    <div><span>Copyleft</span><strong>{copyleftCount}</strong></div>
                  </div>

                  {copyleftCount > 0 && (
                    <div className="license-notice">
                      <strong>License review recommended</strong>
                      <span>{copyleftCount} selected {copyleftCount === 1 ? "project has" : "projects have"} copyleft terms.</span>
                    </div>
                  )}
                </>
              )}

              <div className="download-actions">
                <button className="button button-primary" disabled={selectedProjects.length === 0} onClick={downloadManifest}>
                  Download manifest
                </button>
                <button className="button button-secondary" disabled={selectedProjects.length === 0} onClick={downloadSourcesScript}>
                  Download sources.sh
                </button>
                <button className="text-button copy-button" disabled={selectedProjects.length === 0} onClick={copyStack}>
                  {copied ? "Copied to clipboard" : "Copy project list"}
                </button>
              </div>
              <p className="stack-footnote">Downloads source repositories only. Review each project’s setup and license before use.</p>
            </aside>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-inner">
          <div className="brand"><span className="brand-mark">O</span><span>OpenPlanTier</span></div>
          <p>An independent open-source catalog. Not affiliated with Palantir Technologies.</p>
          <span>Catalog snapshot · 2026.08</span>
        </div>
      </footer>
    </div>
  );
}
