import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table.jsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip.jsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./avatar.jsx";
import { Badge } from "./badge.jsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu.jsx";
import { Button } from "./button.jsx";
import { Input } from "./input.jsx";

// Fallback Shiftlyin Platform Data
const defaultShiftlyinData = [
  {
    id: "1",
    title: "Weekend Barista & Cashier",
    repo: "Shiftlyin Cafe & Bakery - Sector 62",
    status: "Active",
    team: "Hospitality",
    tech: "Coffee Brewing, POS",
    createdAt: "2026-07-28",
    contributors: [
      {
        name: "Aman Sharma",
        email: "aman@shiftlyin.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aman",
        role: "Student Worker",
      },
      {
        name: "Priya Patel",
        email: "priya@shiftlyin.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        role: "Verified Student",
      },
    ],
  },
  {
    id: "2",
    title: "Event Ushering Crew",
    repo: "Tech Expo - Pragati Maidan",
    status: "In Progress",
    team: "Events & Exhibitions",
    tech: "Crowd Control, Ticketing",
    createdAt: "2026-07-27",
    contributors: [
      {
        name: "Rahul Verma",
        email: "rahul@shiftlyin.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
        role: "Lead Promoter",
      },
      {
        name: "Sneha Gupta",
        email: "sneha@shiftlyin.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
        role: "Registration Crew",
      },
    ],
  },
  {
    id: "3",
    title: "Retail Store Helper",
    repo: "Trends Fashion Store - Mall Rd",
    status: "Active",
    team: "Retail & Sales",
    tech: "Stock Auditing, Sales",
    createdAt: "2026-07-25",
    contributors: [
      {
        name: "Vikram Singh",
        email: "vikram@shiftlyin.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
        role: "Store Assistant",
      },
    ],
  },
  {
    id: "4",
    title: "Kitchen Delivery Assistant",
    repo: "Fresh Bites Cloud Kitchen",
    status: "Active",
    team: "Logistics",
    tech: "Packing, Dispatch",
    createdAt: "2026-07-24",
    contributors: [
      {
        name: "Neha Joshi",
        email: "neha@shiftlyin.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
        role: "Shift Helper",
      },
    ],
  },
  {
    id: "5",
    title: "GPS Attendance Core Engine",
    repo: "Shiftlyin Platform Tech Stack",
    status: "Active",
    team: "Platform Infra",
    tech: "React, Firebase, GPS",
    createdAt: "2026-07-20",
    contributors: [
      {
        name: "Himanshu T",
        email: "admin@shiftlyin.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
        role: "Platform Admin",
      },
    ],
  },
];

const allColumns = [
  "Project",
  "Repository",
  "Team",
  "Tech",
  "Created At",
  "Contributors",
  "Status",
];

export function ContributorsTable({ items = [], customData = null }) {
  const [visibleColumns, setVisibleColumns] = useState([...allColumns]);
  const [statusFilter, setStatusFilter] = useState("");
  const [techFilter, setTechFilter] = useState("");

  // Map real Firestore jobs/items if provided, else use default dataset
  const dataset = React.useMemo(() => {
    if (customData && customData.length > 0) return customData;
    if (items && items.length > 0) {
      return items.map((item, idx) => ({
        id: item.id || String(idx + 1),
        title: item.title || item.name || "Shift Job #" + (idx + 1),
        repo: item.businessName || item.location || "Shiftlyin Partner Venue",
        status: item.status === "active" ? "Active" : item.status === "pending" ? "In Progress" : item.status || "Active",
        team: item.category || item.role || "General Shift",
        tech: item.salary ? `₹${item.salary} / shift` : "Part-Time",
        createdAt: item.createdAt?.toDate ? item.createdAt.toDate().toISOString().split("T")[0] : (item.createdAt || "2026-07-28"),
        contributors: [
          {
            name: item.contactPerson || item.studentName || "Verified Worker",
            email: item.email || "user@shiftlyin.com",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id || idx}`,
            role: item.role || "Applicant",
          },
        ],
      }));
    }
    return defaultShiftlyinData;
  }, [items, customData]);

  const filteredData = dataset.filter((project) => {
    return (
      (!statusFilter || project.status.toLowerCase().includes(statusFilter.toLowerCase())) &&
      (!techFilter || (project.tech && project.tech.toLowerCase().includes(techFilter.toLowerCase())))
    );
  });

  const toggleColumn = (col) => {
    setVisibleColumns((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  };

  return (
    <div
      style={{
        background: "var(--surface, #ffffff)",
        border: "1px solid var(--border, #e5e7eb)",
        borderRadius: "16px",
        padding: "clamp(12px, 3vw, 20px)",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        overflow: "hidden"
      }}
    >
      {/* Control Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          width: "100%"
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "240px" }}>
          <Input
            placeholder="Filter by category/tech..."
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            style={{
              minWidth: "160px",
              flex: 1,
              height: "38px",
              padding: "0 12px",
              borderRadius: "10px",
              border: "1px solid var(--border, #e2e8f0)",
              background: "var(--surface-soft, #f8fafc)",
              color: "var(--text, #0f172a)",
              fontSize: "13px"
            }}
          />
          <Input
            placeholder="Filter by status..."
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              minWidth: "160px",
              flex: 1,
              height: "38px",
              padding: "0 12px",
              borderRadius: "10px",
              border: "1px solid var(--border, #e2e8f0)",
              background: "var(--surface-soft, #f8fafc)",
              color: "var(--text, #0f172a)",
              fontSize: "13px"
            }}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              style={{
                height: "38px",
                padding: "0 16px",
                borderRadius: "10px",
                border: "1px solid var(--border, #e2e8f0)",
                background: "var(--surface, #ffffff)",
                color: "var(--text, #0f172a)",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              Columns ⚙️
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            style={{
              background: "var(--surface, #ffffff)",
              border: "1px solid var(--border, #e2e8f0)",
              padding: "8px",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              zIndex: 999
            }}
          >
            {allColumns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col}
                checked={visibleColumns.includes(col)}
                onCheckedChange={() => toggleColumn(col)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "var(--text, #0f172a)"
                }}
              >
                {col}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Scrollable Responsive Table Wrapper */}
      <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <Table style={{ width: "100%", minWidth: "680px", borderCollapse: "collapse" }}>
          <TableHeader>
            <TableRow style={{ borderBottom: "1px solid var(--border, #e2e8f0)" }}>
              {visibleColumns.includes("Project") && <TableHead style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: "800", color: "var(--muted, #64748b)" }}>PROJECT / JOB</TableHead>}
              {visibleColumns.includes("Repository") && <TableHead style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: "800", color: "var(--muted, #64748b)" }}>VENUE / DETAILS</TableHead>}
              {visibleColumns.includes("Team") && <TableHead style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: "800", color: "var(--muted, #64748b)" }}>CATEGORY</TableHead>}
              {visibleColumns.includes("Tech") && <TableHead style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: "800", color: "var(--muted, #64748b)" }}>PAY / TECH</TableHead>}
              {visibleColumns.includes("Created At") && <TableHead style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: "800", color: "var(--muted, #64748b)" }}>DATE</TableHead>}
              {visibleColumns.includes("Contributors") && <TableHead style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: "800", color: "var(--muted, #64748b)" }}>TEAM / WORKERS</TableHead>}
              {visibleColumns.includes("Status") && <TableHead style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: "800", color: "var(--muted, #64748b)" }}>STATUS</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length ? (
              filteredData.map((project) => (
                <TableRow key={project.id} style={{ borderBottom: "1px solid var(--border, #f1f5f9)" }}>
                  {visibleColumns.includes("Project") && (
                    <TableCell style={{ padding: "14px", fontWeight: "700", color: "var(--text, #0f172a)", whiteSpace: "nowrap" }}>
                      {project.title}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Repository") && (
                    <TableCell style={{ padding: "14px", whiteSpace: "nowrap" }}>
                      <span style={{ color: "var(--primary, #2563eb)", fontWeight: "600", fontSize: "13px" }}>
                        {project.repo}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.includes("Team") && (
                    <TableCell style={{ padding: "14px", color: "var(--text, #334155)", fontSize: "13px", whiteSpace: "nowrap" }}>
                      {project.team}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Tech") && (
                    <TableCell style={{ padding: "14px", color: "var(--muted, #64748b)", fontSize: "13px", whiteSpace: "nowrap" }}>
                      {project.tech}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Created At") && (
                    <TableCell style={{ padding: "14px", color: "var(--muted, #64748b)", fontSize: "13px", whiteSpace: "nowrap" }}>
                      {project.createdAt}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Contributors") && (
                    <TableCell style={{ padding: "14px", minWidth: "120px" }}>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <TooltipProvider>
                          {project.contributors && project.contributors.map((contributor, idx) => (
                            <Tooltip key={idx}>
                              <TooltipTrigger asChild>
                                <Avatar style={{ width: "32px", height: "32px", border: "2px solid #ffffff", borderRadius: "50%", background: "#e2e8f0" }}>
                                  <AvatarImage src={contributor.avatar} alt={contributor.name} />
                                  <AvatarFallback>{contributor.name ? contributor.name[0] : "W"}</AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent style={{ background: "#0f172a", color: "#ffffff", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", zIndex: 999 }}>
                                <p style={{ fontWeight: "700", margin: 0 }}>{contributor.name}</p>
                                <p style={{ fontSize: "11px", opacity: 0.8, margin: 0 }}>{contributor.email}</p>
                                <p style={{ fontSize: "11px", fontStyle: "italic", margin: 0 }}>{contributor.role}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes("Status") && (
                    <TableCell style={{ padding: "14px", whiteSpace: "nowrap" }}>
                      <Badge
                        style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontWeight: "700",
                          fontSize: "12px",
                          color: "#ffffff",
                          display: "inline-block",
                          background:
                            project.status === "Active"
                              ? "#16a34a"
                              : project.status === "In Progress"
                              ? "#d97706"
                              : "#6b7280"
                        }}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} style={{ textAlign: "center", padding: "24px", color: "var(--muted, #64748b)" }}>
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export const DemoOne = () => {
  return <ContributorsTable />;
};

export default ContributorsTable;
