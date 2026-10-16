# Semantic — High-Performance Codebase Distillation & GraphRAG Context Engine
## Master Architecture Plan & Website Technical Blueprint

> **Document Scope:** This document contains (1) the **Website Tech Stack Blueprint** for the Semantic marketing and interactive developer portal, and (2) the **Systems Engineering & Architecture Plan** for the core `Semantic` Rust engine (`semantic-cli` and Model Context Protocol server).

---

## Part I: Website Tech Stack Blueprint

The **Semantic** web experience is inspired by **TwelveLabs** (editorial dark-to-iridescent-pastel transitions, 3D isometric technical diagrams, floating glassmorphic context cards, and oversized typographic rhythm), **xAI** (developer-first interactive code terminals and rolling metric counters), and **ElevenLabs** (crisp split-view comparisons and interactive sandboxes).

| Layer | Technology | Version / Package | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **Core Framework** | **React + TypeScript** | `react@^19.0.0`, `typescript@~5.7` | Type-safe component hierarchy, declarative state for interactive sandboxes, and clean WebGL lifecycle management. |
| **Build Tooling** | **Vite** | `vite@^6.0.0` | Instant ES module dev server, zero-config GLSL/shader string bundling, and optimized production chunking. |
| **Smooth Scrolling** | **Lenis** | `lenis@^1.2.0` | Physics-based momentum and weight on page scroll, bridged directly to `gsap.ticker` and `ScrollTrigger.update` for zero-jitter scroll-linked animations. |
| **Animation Engine** | **GSAP + ScrollTrigger** | `gsap@^3.12.7`, `@gsap/react` | Orchestrates staggered headline reveals, scrubbed section transitions, odometer metric counters, and pin/scrub timeline sequences. |
| **Hero WebGL2 Shader** | **`<GradientASCII />` (React Bits)** | Custom WebGL2 Multi-Pass FBO | 4-pass WebGL2 pipeline (`FIELD`, `HALO`, `BLUR`, `COMPOSITE`) with Oklab perceptual color ramps, dynamic glyph texture atlas, cursor scramble trails, and click shockwaves. |
| **3D Isometric WebGL** | **Three.js / WebGL** | `three@^0.174.0` | Powers the 3D Isometric Topological Cylinder (4-Stage Pipeline), the 3-Tier Refractive Prism Stack, and the Dual Engine Isometric Node-Matrix canvases. |
| **Styling System** | **Tailwind CSS v4** | `tailwindcss@^4.0.0`, `@tailwindcss/vite` | Utility-first styling paired with custom CSS tokens for obsidian dark surfaces (`#090A0D`) and TwelveLabs-inspired iridescent pastel mesh gradients (`#D9F99D` → `#FDE68A` → `#F5D0FE` → `#FAF9F5`). |
| **Typography** | **Instrument Serif, Plus Jakarta Sans, Geist Mono** | Google Fonts | High-contrast editorial serif headlines paired with geometric sans UI body text and crisp monospace code/AST callouts. |

---

## Part II: Core `Semantic` Engine Architecture Plan

### 1. Problem Statement: The Enterprise Repository Context Bottleneck

When AI coding agents (such as Cursor, Claude Code, Windsurf, or custom autonomous SWE agents) operate on a multi-million-line production repository, two naive approaches fail:

1. **Raw File Feeding**: Context windows rapidly saturate on boilerplate implementations (getters, setters, repetitive error handling, generated code), inflating latency and API costs while degrading reasoning accuracy ("lost-in-the-middle" phenomenon).
2. **Naive Text Chunking (Standard Vector RAG)**: Splitting source files by fixed character counts or line windows severs syntactic boundaries, loses cross-file type definitions and trait implementations, and fails to answer structural questions (*"What breaks if I change the return signature of `TokenBucket::check`?"*).

**Semantic** solves this by transforming raw source code into an **ultra-dense, hierarchical directed knowledge graph** paired with **3-tier distilled structural summaries**, delivering exact topological context to AI coding agents in **sub-50 milliseconds** (`~30 tokens` per neighborhood instead of `5,000+ lines` of raw code).

---

### 2. End-to-End 4-Stage Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          SEMANTIC ENGINE (RUST + RAYON + MMAP)                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  STAGE 1: Multi-Language AST Parsing (tree-sitter + rayon)                              │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   Rust   │  │ TypeScript │  │  Python  │  │    Go    │  │   C++    │                 │
│  └────┬─────┘  └─────┬──────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│       └──────────────┴──────────────┼─────────────┴─────────────┘                       │
│                                     ▼                                                   │
│       Atomic Code Block Extraction (Functions, Methods, Structs, Classes, Traits)       │
│                                     │                                                   │
│  STAGE 2: Directed Symbol & Dependency Graph Construction                               │
│                                     ▼                                                   │
│       Nodes: [Signature, ReturnType, FilePath, LineRange, ASTBlake3Hash]                │
│       Edges: [calls, inherits, imports, implements_trait, modifies_state]               │
│       Storage: Zero-Copy Compressed Sparse Row (CSR) via memmap2 + rkyv                 │
│                                     │                                                   │
│  STAGE 3: Hierarchical 3-Tier Distillation                                              │
│       ├── Tier 1 (Surface Index): Paths, Public Signatures, Types (Always Loaded)       │
│       ├── Tier 2 (Structural Summary): 2-Sentence Business Logic & Invariants           │
│       └── Tier 3 (Raw Implementation): Byte-Offset Slice Pointers (Lazy On-Demand)      │
│                                     │                                                   │
│  STAGE 4: Hybrid GraphRAG Retrieval Engine (<50ms p99)                                  │
│       ├── Sparse Lexical Search (FST + Sub-Token Identifier Index)                      │
│       ├── Dense Vector Search (USearch HNSW Int8 Embeddings)                            │
│       ├── Reciprocal Rank Fusion (RRF) + N-Hop Directed Graph Expansion                 │
│       └── Compact Context Markdown Serializer (~30 Tokens) ──► CLI / MCP Server         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Detailed Stage Specifications

#### Stage 1: Multi-Language AST Parsing (`crates/semantic-parser`)

* **Mechanism:** Replaces line/token chunking with compiled C/Rust **Tree-Sitter** grammars (`tree-sitter-rust`, `tree-sitter-typescript`, `tree-sitter-python`, `tree-sitter-go`, `tree-sitter-cpp`).
* **Parallel Execution Model:**
  * Uses `ignore::WalkParallel` (the engine behind `ripgrep`) to traverse git-tracked files while respecting `.gitignore` and `.semanticignore`.
  * Dispatches file buffers across a `rayon` work-stealing thread pool. Each worker thread maintains a `thread_local!` pool of pre-initialized `tree_sitter::Parser` instances to avoid lock contention and heap re-allocation.
* **Atomic Symbol Extraction:**
  * Executes compiled Tree-Sitter S-expression queries (`.scm`) to extract atomic syntactic units:
    * `Function` / `Method` (including async, const, unsafe, receiver `&self` metadata)
    * `Struct` / `Class` / `Enum` / `Union`
    * `Trait` / `Interface` / `TypeAlias`
    * `ModuleExport` / `ImportDeclaration` / `GlobalStatic`
  * Computes a deterministic **Blake3 hash** of each symbol's normalized AST subtree (stripping whitespace and comments) so incremental builds only re-index modified symbols.

#### Stage 2: Directed Symbol & Dependency Graph Construction (`crates/semantic-graph`)

* **Graph Topology:**
  * Built in-memory during ingestion and persisted as a **Compressed Sparse Row (CSR)** adjacency structure with bidirectional lookup arrays (`forward_edges` for outgoing calls/dependencies, `reverse_edges` for incoming callers/dependents).
* **Node Schema (`SymbolNode`):**
  ```rust
  #[repr(C)]
  pub struct SymbolNode {
      pub symbol_id: SymbolId,          // 32-bit dense index
      pub qualified_name: SymbolStrId,  // Interned in string arena (e.g., "rate_limiter::TokenBucket::check")
      pub kind: SymbolKind,             // Function, Method, Struct, Trait, Interface, Enum, Module
      pub visibility: Visibility,       // Public, Crate, Protected, Private
      pub file_id: FileId,              // Maps to repo-relative path (e.g., "src/net/ratelimit.rs")
      pub start_line: u32,
      pub end_line: u32,
      pub byte_range: (u32, u32),       // Exact byte slice for O(1) Tier 3 source retrieval
      pub signature: SymbolStrId,       // Canonical type signature + return type
      pub ast_hash: [u8; 32],           // Blake3 content hash for incremental cache invalidation
  }
  ```
* **Edge Schema (`SemanticEdge`):**
  * `Calls`: Function/Method $A$ invokes Function/Method $B$.
  * `Inherits`: Class/Interface $A$ extends $B$.
  * `Imports`: Module $A$ imports symbol/module $B$.
  * `ImplementsTrait`: Struct/Class $A$ implements Trait/Interface $B$.
  * `ModifiesState`: Function/Method $A$ mutates shared field, static, or external store $B$.
* **Cross-File Symbol Resolution:**
  * **Pass 1 (Symbol Export Table):** Collects all module declarations, file paths, `pub use` / `export *` re-exports, and `tsconfig.json` / `Cargo.toml` / `go.mod` path aliases.
  * **Pass 2 (Reference Binding):** Resolves call-site identifiers and type references across directory boundaries using lexical scope chains + import maps, linking caller and callee `SymbolId`s into the CSR graph.

#### Stage 3: Hierarchical Distillation & Summarization (`crates/semantic-distill`)

* **The Compression Problem:** Full function bodies consume excessive tokens, while standard RAG strips away architectural relationships.
* **Three-Tier Context Hierarchy:**
  1. **Tier 1 — Surface Index (Always Loaded in Agent Context):**
     * Contains file paths, module hierarchy, public symbol signatures, and core type definitions.
     * Achieves `~92%` token reduction relative to raw source files while giving the LLM complete global awareness of what exists in the repository.
  2. **Tier 2 — Structural Summary (Generated & Cached at Ingestion):**
     * A dense **2-sentence natural language summary** capturing a symbol's business logic, pre/post-condition invariants, error types, and side effects.
     * Generated during `semantic index` via a fast local quantized model (e.g., `Qwen2.5-Coder-1.5B-Instruct` via ONNX Runtime / `candle` or batch local API) and keyed by the symbol's `ast_hash` so unchanged symbols are never re-summarized.
  3. **Tier 3 — Raw Implementation (On-Demand Dynamic Inspection):**
     * Zero-duplication storage: Semantic reads exact byte spans `[start_byte..end_byte]` directly from the working tree file via `mmap` only when the agent explicitly requests deep code inspection of a specific node.

#### Stage 4: Hybrid GraphRAG Retrieval Engine (`crates/semantic-index`)

* **Dual Search Vector:**
  1. **Sparse Lexical Matching:** Finite State Transducer (`fst` crate) + camelCase/snake_case sub-token inverted index for sub-millisecond exact or prefix identifier lookup (e.g., `TokenBucket::check`, `ratelimit`).
  2. **Dense Vector Embeddings:** Lightweight embedded HNSW index (`usearch` with `i8` scalar quantization) indexing the concatenation of `[Qualified Name + Signature + Tier 2 Structural Summary]` for semantic intent queries (e.g., *"find where sliding window IP rate limiting is enforced"*).
* **Reciprocal Rank Fusion (RRF) & $N$-Hop Graph Traversal Expansion:**
  * Combines sparse and dense candidate lists via RRF to select top seed nodes $S$.
  * For each seed node $v \in S$, traverses incoming edges (`Calls`, `ImplementsTrait`) and outgoing edges (`Calls`, `ModifiesState`) up to $N$ hops (default $N = 1$ or $2$ with degree-aware pruning), assembling a complete local architectural subgraph in `<50ms`.

---

### 4. Compact Context Representation Format

When an AI coding agent queries Semantic, the engine serializes the resolved graph neighborhood into a deterministic, token-efficient Markdown payload (~30–45 tokens per symbol):

```markdown
### Target Symbol: `rate_limiter::TokenBucket::check`
* **File:** `src/net/ratelimit.rs:42`
* **Type:** Method (Public)
* **Summary:** Evaluates incoming request IP against sliding window redis counters. Returns `Result<bool, RateLimitError>`.

#### Direct Dependencies (Incoming Edges)
* `api::v1::auth::verify_session` (`src/api/auth.rs:112`)
* `gateway::proxy_router` (`src/gateway/router.rs:78`)

#### Direct Sub-Calls (Outgoing Edges)
* `redis::Client::get_counter` (`src/db/redis.rs:15`)
* `metrics::increment_counter` (`src/monitoring/metrics.rs:30`)
```

---

### 5. Storage Layout, CLI & MCP Server Protocol

#### 5.1 Zero-Copy Disk Format (`.semantic/` Directory)
```text
.semantic/
├── manifest.json          # Schema version, git HEAD commit SHA, language breakdown
├── strings.arena          # Contiguous UTF-8 interned string buffer
├── nodes.rkyv             # Zero-copy memory-mapped SymbolNode array
├── edges_fwd.csr          # Outgoing CSR row offsets + edge targets/kinds
├── edges_rev.csr          # Incoming CSR row offsets + caller sources/kinds
├── tier2_summaries.bin    # Blake3-keyed LZ4-compressed Tier 2 structural summaries
├── lexical.fst            # Finite State Transducer for sub-millisecond symbol lookup
└── vectors.usearch        # Quantized HNSW vector index
```

#### 5.2 CLI Interface (`semantic-cli`)
* `semantic index [PATH] --threads auto --tier2-model local` — Indexes 500,000+ LOC in seconds using parallel `rayon` workers.
* `semantic query "<intent or symbol>" --hops 1 --format markdown` — Returns the Compact Context Markdown in `<50ms`.
* `semantic inspect <qualified_symbol>` — Fetches Tier 3 raw implementation + callers/callees.
* `semantic serve --mcp-stdio` — Starts the Model Context Protocol server for Cursor, Claude Desktop, and Windsurf.

#### 5.3 Model Context Protocol (MCP) Tools Exposed
1. `semantic_search_context(query: string, hops?: number, top_k?: number)` → Returns Tier 1 + Tier 2 Compact Context Markdown for matching symbols and their $N$-hop graph neighborhood.
2. `semantic_trace_symbol(symbol: string, direction: "incoming" | "outgoing" | "both", depth?: number)` → Returns the directed call and type dependency subgraph.
3. `semantic_get_surface_index(path_prefix?: string)` → Returns Tier 1 signatures and public types for a module or directory.
4. `semantic_inspect_raw(symbol: string)` → Returns Tier 3 exact source lines from disk.

---

### 6. Phased Implementation Roadmap (For Core Engine)

* **Phase 1 — Parallel Tree-Sitter AST Core (Weeks 1–2):** Implement `semantic-core` and `semantic-parser` with Rust, TypeScript, Python, Go, and C++ `.scm` queries + `rayon` parallel walker.
* **Phase 2 — CSR Directed Graph & Cross-File Linker (Weeks 3–4):** Build two-pass cross-file import/symbol resolver and zero-copy `memmap2` + `rkyv` graph serialization.
* **Phase 3 — 3-Tier Distiller & Hybrid Index (Weeks 5–6):** Integrate Blake3-cached Tier 2 structural summarization, `fst` lexical index, and `usearch` HNSW vector index with RRF + $N$-hop expansion.
* **Phase 4 — `semantic-cli` & MCP Server Release (Weeks 7–8):** Ship single static binary for macOS/Linux/Windows with stdio/SSE MCP support for Cursor and Claude Desktop plus GitHub Actions CI caching.
