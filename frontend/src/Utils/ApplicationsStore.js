const STORAGE_PREFIX = "talentai.applications.v1";

export const applicationStages = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "conversation", label: "In conversation" },
  { value: "interview", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "closed", label: "Closed" },
];

const storageKey = (identity) =>
  `${STORAGE_PREFIX}.${encodeURIComponent(identity || "candidate")}`;

const readStore = (identity) => {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(identity)) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStore = (identity, applications) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey(identity), JSON.stringify(applications));
  }

  return applications;
};

const getRoleId = (job) => {
  const id = job?.id ?? job?.jobId;
  if (id !== undefined && id !== null && String(id).trim()) return String(id);

  return [job?.company, job?.companyName, job?.title]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export const getApplications = (identity) => readStore(identity);

export const trackRole = (job, identity) => {
  const applications = readStore(identity);
  const roleId = getRoleId(job);
  const existing = applications.find((application) => application.roleId === roleId);

  if (existing) return { applications, created: false };

  const now = new Date().toISOString();
  const application = {
    roleId,
    title: job?.title || "Untitled role",
    company: job?.company || job?.companyName || "Company not listed",
    location: job?.location || "Location flexible",
    employmentType: job?.employmentType || "Full time",
    jobDescription: job?.jobDescription || "",
    skills: job?.skills || "",
    experience: job?.experience || "",
    stage: "saved",
    trackedAt: now,
    updatedAt: now,
  };

  return {
    applications: writeStore(identity, [application, ...applications]),
    created: true,
  };
};

export const setApplicationStage = (roleId, stage, identity) => {
  const applications = readStore(identity).map((application) =>
    application.roleId === roleId
      ? { ...application, stage, updatedAt: new Date().toISOString() }
      : application
  );

  return writeStore(identity, applications);
};

export const removeApplication = (roleId, identity) => {
  const applications = readStore(identity).filter(
    (application) => application.roleId !== roleId
  );

  return writeStore(identity, applications);
};