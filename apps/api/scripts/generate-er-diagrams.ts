/**
 * Generates docs/database/04-er-diagrams.md from the LIVE, migrated database (not by hand), so the
 * diagrams always show exactly what PostgreSQL enforces: tables, columns, primary keys, foreign
 * keys, nullability (cardinality) and unique constraints.
 *
 *   npm run db:er
 *
 * Module grouping comes from the schema files (prisma/schema/NN_*.prisma).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from '../src/db/prisma.ts';

const here = dirname(fileURLToPath(import.meta.url));
const schemaDir = join(here, '..', 'prisma', 'schema');
const outFile = join(here, '..', '..', '..', 'docs', 'database', '04-er-diagrams.md');

// ---------- modules from schema files ----------
type Module = { file: string; title: string; models: string[] };
const modules: Module[] = readdirSync(schemaDir)
  .filter((f) => /^\d\d_.*\.prisma$/.test(f) && f !== '00_enums.prisma')
  .sort()
  .map((file) => {
    const text = readFileSync(join(schemaDir, file), 'utf8');
    const title = (text.split('\n')[0] ?? file).replace(/^\/\/\s*/, '').trim();
    const models = [...text.matchAll(/^model\s+(\w+)\s*\{/gm)].map((m) => m[1]!);
    return { file, title, models };
  });
const moduleOf = new Map<string, Module>();
for (const m of modules) for (const model of m.models) moduleOf.set(model, m);

// ---------- database introspection ----------
type Col = { table: string; column: string; type: string; nullable: boolean; position: number };
type Fk = { name: string; child: string; childCols: string[]; parent: string; parentCols: string[]; onDelete: string };

const columns = await prisma.$queryRaw<Col[]>`
  SELECT c.table_name AS "table", c.column_name AS "column",
         CASE WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name
              WHEN c.data_type = 'ARRAY' THEN replace(c.udt_name, '_', '') || '_array'
              WHEN c.data_type = 'numeric' THEN 'decimal'
              WHEN c.data_type = 'character varying' THEN 'varchar'
              WHEN c.data_type = 'character' THEN 'char'
              WHEN c.data_type = 'timestamp with time zone' THEN 'timestamptz'
              WHEN c.data_type = 'boolean' THEN 'bool'
              ELSE replace(c.data_type, ' ', '_') END AS "type",
         (c.is_nullable = 'YES') AS "nullable", c.ordinal_position AS "position"
  FROM information_schema.columns c
  JOIN information_schema.tables t ON t.table_name = c.table_name AND t.table_schema = c.table_schema
  WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE' AND c.table_name <> '_prisma_migrations'
  ORDER BY c.table_name, c.ordinal_position`;

const fks = await prisma.$queryRaw<Fk[]>`
  SELECT con.conname AS "name", cl.relname AS "child", pl.relname AS "parent",
         array(SELECT a.attname FROM unnest(con.conkey) WITH ORDINALITY k(n, i) JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.n ORDER BY k.i)::text[] AS "childCols",
         array(SELECT a.attname FROM unnest(con.confkey) WITH ORDINALITY k(n, i) JOIN pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = k.n ORDER BY k.i)::text[] AS "parentCols",
         CASE con.confdeltype WHEN 'c' THEN 'CASCADE' WHEN 'r' THEN 'RESTRICT' WHEN 'n' THEN 'SET NULL' WHEN 'a' THEN 'NO ACTION' WHEN 'd' THEN 'SET DEFAULT' END AS "onDelete"
  FROM pg_constraint con
  JOIN pg_class cl ON cl.oid = con.conrelid
  JOIN pg_class pl ON pl.oid = con.confrelid
  JOIN pg_namespace ns ON ns.oid = cl.relnamespace
  WHERE con.contype = 'f' AND ns.nspname = 'public'
  ORDER BY cl.relname, con.conname`;

// Unique column sets (PK + non-partial unique indexes) per table.
const uniques = await prisma.$queryRaw<{ table: string; cols: string[]; isPk: boolean }[]>`
  SELECT t.relname AS "table", i.indisprimary AS "isPk",
         array(SELECT a.attname FROM unnest(i.indkey) WITH ORDINALITY k(n, o) JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.n ORDER BY k.o)::text[] AS "cols"
  FROM pg_index i JOIN pg_class t ON t.oid = i.indrelid JOIN pg_namespace ns ON ns.oid = t.relnamespace
  WHERE ns.nspname = 'public' AND i.indisunique AND i.indpred IS NULL`;

await prisma.$disconnect();

// ---------- helpers ----------
const colsByTable = new Map<string, Col[]>();
for (const c of columns) colsByTable.set(c.table, [...(colsByTable.get(c.table) ?? []), c]);
const key = (cols: string[]) => [...cols].sort().join(',');
const uniqueSets = new Map<string, Set<string>>();
const pkCols = new Map<string, Set<string>>();
for (const u of uniques) {
  if (!uniqueSets.has(u.table)) uniqueSets.set(u.table, new Set());
  uniqueSets.get(u.table)!.add(key(u.cols));
  if (u.isPk) pkCols.set(u.table, new Set(u.cols));
}
const fkColsByTable = new Map<string, Set<string>>();
for (const f of fks) for (const c of f.childCols) fkColsByTable.set(f.child, new Set([...(fkColsByTable.get(f.child) ?? []), c]));
const singleUnique = (table: string, col: string) => uniqueSets.get(table)?.has(col) ?? false;

function relationLine(f: Fk): string {
  const cols = colsByTable.get(f.child) ?? [];
  const required = f.childCols.every((c) => cols.find((x) => x.column === c)?.nullable === false);
  const oneToOne = uniqueSets.get(f.child)?.has(key(f.childCols)) ?? false;
  const left = required ? '||' : '|o';
  const right = oneToOne ? 'o|' : 'o{';
  return `    ${f.parent} ${left}--${right} ${f.child} : "${f.childCols.join(', ')}"`;
}

function entityBlock(table: string): string {
  const cols = colsByTable.get(table) ?? [];
  const lines = cols.map((c) => {
    const keys: string[] = [];
    if (pkCols.get(table)?.has(c.column)) keys.push('PK');
    if (fkColsByTable.get(table)?.has(c.column)) keys.push('FK');
    if (!pkCols.get(table)?.has(c.column) && singleUnique(table, c.column)) keys.push('UK');
    const nullable = c.nullable ? ' "nullable"' : '';
    return `        ${c.type} ${c.column}${keys.length ? ' ' + keys.join(', ') : ''}${nullable}`;
  });
  return `    ${table} {\n${lines.join('\n')}\n    }`;
}

// References that appear on almost every table; listed in the relationship tables but left out of
// the module pictures so the pictures stay readable.
const NOISY_PARENTS = new Set(['MeasurementUnit', 'ContentSource', 'Language']);
const AUDIT_USER_COLUMNS = new Set([
  'createdById', 'approvedById', 'reviewedById', 'reviewerId', 'uploadedById',
  'verifiedById', 'assignedById', 'confirmedById', 'performedById',
]);
const isAuditUserRef = (f: Fk) => f.parent === 'User' && f.childCols.some((c) => AUDIT_USER_COLUMNS.has(c));
const isNoisy = (f: Fk) => NOISY_PARENTS.has(f.parent) || isAuditUserRef(f) || (f.child === 'Translation' && f.parent !== 'Language') || f.child === 'ContentReview';

// ---------- overview ----------
const CORE = [
  'User', 'Farm', 'FarmPlot', 'SoilTest', 'SoilTestResult', 'WaterSource', 'PlotWaterSource',
  'CropCategory', 'CropCategoryMapping', 'Crop', 'CropVariety', 'CropRequirement', 'AgronomicParameter',
  'GrowingProcedure', 'ProcedureVersion', 'GrowingStage', 'StageInstruction', 'StageMedia', 'MediaAsset',
  'CropRecommendation', 'CropRecommendationItem', 'CropRecommendationReason',
  'FarmCrop', 'CropTask', 'CropActivityLog', 'CropExpense', 'HarvestRecord', 'SalesRecord',
];
const coreSet = new Set(CORE);
const coreEdges = fks.filter((f) => coreSet.has(f.child) && coreSet.has(f.parent) && !isAuditUserRef(f) && f.child !== f.parent);
// Deduplicate parallel edges between the same pair for the overview.
const seen = new Set<string>();
const overviewLines: string[] = [];
for (const f of coreEdges) {
  const pair = `${f.parent}>${f.child}`;
  if (seen.has(pair)) continue;
  seen.add(pair);
  overviewLines.push(relationLine(f));
}

// ---------- write markdown ----------
const tables = [...colsByTable.keys()];
let md = `# KrishiSutra — Entity-Relationship Diagrams

> **Generated** by \`npm run db:er\` (apps/api/scripts/generate-er-diagrams.ts) from the migrated
> PostgreSQL database — do not edit by hand. Cardinality comes from the real constraints:
> \`||\` required, \`|o\` optional, \`o{\` many, \`o|\` at most one (unique FK).

**Totals:** ${tables.length} tables · ${fks.length} foreign keys · ${modules.length} schema modules.
See [03 — Database Architecture](03-database-architecture.md) for the design explanation.

## Contents

- [Core overview](#core-overview)
${modules.map((m) => `- [${m.title}](#${m.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-')})`).join('\n')}

## Core overview

How the main concepts connect — shared agricultural knowledge on one side, each farmer's own records
on the other, and recommendations / cultivations linking the two. (Audit references and units omitted.)
If the diagram does not render (for example in the GitHub mobile app), open [er-overview.png](er-overview.png).

\`\`\`mermaid
erDiagram
${overviewLines.join('\n')}
\`\`\`
`;

for (const m of modules) {
  const own = m.models.filter((t) => colsByTable.has(t));
  const moduleFks = fks.filter((f) => moduleOf.get(f.child) === m);
  const drawn = moduleFks.filter((f) => !isNoisy(f) || (moduleOf.get(f.parent) === m));
  md += `\n## ${m.title}\n\nSchema file: \`apps/api/prisma/schema/${m.file}\` · Tables: ${own.map((t) => `\`${t}\``).join(', ')}\n\n`;
  md += '```mermaid\nerDiagram\n';
  md += own.map(entityBlock).join('\n') + '\n';
  md += drawn.map(relationLine).join('\n') + '\n';
  md += '```\n\n';
  md += '<details><summary>All foreign keys in this module</summary>\n\n| Table | Column(s) | References | On delete |\n|---|---|---|---|\n';
  md += moduleFks.map((f) => `| ${f.child} | ${f.childCols.join(', ')} | ${f.parent}(${f.parentCols.join(', ')}) | ${f.onDelete} |`).join('\n');
  md += '\n\n</details>\n';
}

writeFileSync(outFile, md);
console.log(`Wrote ${outFile} (${tables.length} tables, ${fks.length} foreign keys, ${modules.length} modules)`);
