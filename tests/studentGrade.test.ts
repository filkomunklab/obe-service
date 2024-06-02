import { describe, it, expect, beforeAll } from "bun:test";
import { clearDatabase } from "./helpers";
import app from "../src/app";
import prisma from "../src/database";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMDliOTFmZjQtMGY0My00ZjU0LWE2ODctZWIwZGRlZTA5YjA3IiwibmlrIjoiMTEwNjA2MDExNTUiLCJuYW1lIjoiQW5kcmV3IFRhbm55ICBMaWVtIiwicm9sZSI6WyJERUtBTiJdfSwiaWF0IjoxNzE2NjgyMjY3fQ.M5GIsprqN76szJueWQTluJakZpKOEhoEPU73rY3qjgc";
const teacherId = "000aef95-9122-46d7-8b49-46f8afc248ff";
let rpsId: string;
let gradingSystemId: string;

beforeAll(async () => {
  try {
    await clearDatabase();

    // Create new curriculum
    const path = "./tests/testFiles/Kurikulum FILKOM IF 2023 - example.xlsx";
    const file = Bun.file(path);
    let formData = new FormData();
    formData.append("major", "IF");
    formData.append("year", "2023");
    formData.append(
      "headOfProgramStudyId",
      "fb990cd6-1318-4232-97b1-88c0f3b20e6d"
    );
    formData.append("curriculumFile", file);
    const curriculum = await app.request("/api/curriculum", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await curriculum.json();
    const curriculumId = data.data.id;

    // get subject
    const subjects = await prisma.subject.findMany({
      take: 1,
      skip: 20,
    });
    const subjectId = subjects[0]?.id;

    // Create new cpl
    const pathCpl = "./tests/testFiles/Curriculum Cpl IF - example.xlsx";
    const fileCpl = Bun.file(pathCpl);
    const formDataCpl = new FormData();
    formDataCpl.append("file", fileCpl);
    await app.request(`/api/curriculum/${curriculumId}/cpl`, {
      body: formDataCpl,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const cpls = await prisma.cpl.findMany({
      where: {
        curriculumId,
      },
      take: 3,
    });
    const supportedCplIds = cpls.map((cpl) => cpl.id);

    // create RPS
    const body = JSON.stringify({
      teacherId,
      subjectId,
      subjectFamily: "Business and Management",
      subjectDescription:
        "Matakuliah ini mengajarkan pentingnya Business Process Reengineering (BPR) dalam konteks bisnis modern, dengan fokus pada karakteristik esensial BPR, pemodelan proses menggunakan IDEF0 dan BPMN, strategi implementasi, analisis, desain, simulasi, dan evaluasi proses, serta manajemen perubahan dan transisi organisasi. Mahasiswa akan dipersiapkan untuk menghadapi tantangan perubahan dalam organisasi dengan pemahaman mendalam tentang BPR dan keterampilan praktis dalam merancang, mengelola, dan mengoptimalkan proses bisnis. This course teaches the importance of Business Process Reengineering (BPR) in the context of modern business, focusing on the essential characteristics of BPR, process modeling using IDEF0 and BPMN, implementation strategies, process analysis, design, simulation, and evaluation, as well as organizational change management and transition. Students will be prepared to confront the challenges of organizational change with a deep understanding of BPR and practical skills in designing, managing, and optimizing business processes.",
      parallel: "B",
      semester: 6,
      schedule: "Rabu [8.40 - 12.00] at GK1-402",
      rpsDeveloper: "Andrew Tanny Liem, SSi., MT., PhD",
      headOfExpertise: "Andrew Tanny Liem, SSi., MT., PhD",
      headOfProgramStudy: "Stenly Richard Pungus, S.Kom., MT., MM., PhD",
      cpmk: [
        {
          description:
            "Menganalisis dan membandingkan alternatif desain proses yang berbeda, membenarkan pemilihan desain tertentu berdasarkan metrik kinerja dan tujuan strategis",
          code: "CPMK01",
          supportedCplIds,
        },
        {
          description:
            "Menganalisis dan membandingkan alternatif desain proses yang berbeda, membenarkan pemilihan desain tertentu berdasarkan metrik kinerja dan tujuan strategis",
          code: "CPMK02",
          supportedCplIds,
        },
        {
          description:
            "Menganalisis dan membandingkan alternatif desain proses yang berbeda, membenarkan pemilihan desain tertentu berdasarkan metrik kinerja dan tujuan strategis",
          code: "CPMK03",
          supportedCplIds,
        },
        {
          description:
            "Menganalisis dan membandingkan alternatif desain proses yang berbeda, membenarkan pemilihan desain tertentu berdasarkan metrik kinerja dan tujuan strategis",
          code: "CPMK04",
          supportedCplIds,
        },
        {
          description:
            "Menganalisis dan membandingkan alternatif desain proses yang berbeda, membenarkan pemilihan desain tertentu berdasarkan metrik kinerja dan tujuan strategis",
          code: "CPMK05",
          supportedCplIds,
        },
        {
          description:
            "Menganalisis dan membandingkan alternatif desain proses yang berbeda, membenarkan pemilihan desain tertentu berdasarkan metrik kinerja dan tujuan strategis",
          code: "CPMK06",
          supportedCplIds,
        },
        {
          description:
            "Menganalisis dan membandingkan alternatif desain proses yang berbeda, membenarkan pemilihan desain tertentu berdasarkan metrik kinerja dan tujuan strategis",
          code: "CPMK07",
          supportedCplIds,
        },
      ],
      cpmkGrading: [
        {
          code: "CPMK01",
          totalGradingWeight: 11,
          gradingSystem: [
            {
              gradingName: "Presensi",
              gradingWeight: 1,
            },
            {
              gradingName: "Kuis 1",
              gradingWeight: 5,
            },
            {
              gradingName: "Tugas 1",
              gradingWeight: 5,
            },
          ],
        },
        {
          code: "CPMK02",
          totalGradingWeight: 6,
          gradingSystem: [
            {
              gradingName: "Presensi",
              gradingWeight: 1,
            },
            {
              gradingName: "Tugas 1",
              gradingWeight: 5,
            },
          ],
        },
        {
          code: "CPMK03",
          totalGradingWeight: 6,
          gradingSystem: [
            {
              gradingName: "Presensi",
              gradingWeight: 1,
            },
            {
              gradingName: "Tugas 1",
              gradingWeight: 5,
            },
          ],
        },
        {
          code: "CPMK04",
          totalGradingWeight: 11,
          gradingSystem: [
            {
              gradingName: "Presensi",
              gradingWeight: 1,
            },
            {
              gradingName: "Tugas 1",
              gradingWeight: 5,
            },
            {
              gradingName: "Tugas 2",
              gradingWeight: 5,
            },
          ],
        },
        {
          code: "UTS",
          totalGradingWeight: 16,
          gradingSystem: [
            {
              gradingName: "Presensi",
              gradingWeight: 1,
            },
            {
              gradingName: "UTS",
              gradingWeight: 15,
            },
          ],
        },
        {
          code: "CPMK05",
          totalGradingWeight: 6,
          gradingSystem: [
            {
              gradingName: "Presensi",
              gradingWeight: 1,
            },
            {
              gradingName: "Tugas 1",
              gradingWeight: 5,
            },
          ],
        },
        {
          code: "CPMK06",
          totalGradingWeight: 11,
          gradingSystem: [
            {
              gradingName: "Presensi",
              gradingWeight: 1,
            },
            {
              gradingName: "Proyek",
              gradingWeight: 10,
            },
          ],
        },
        {
          code: "CPMK07",
          totalGradingWeight: 16,
          gradingSystem: [
            {
              gradingName: "Presensi",
              gradingWeight: 1,
            },
            {
              gradingName: "Proyek",
              gradingWeight: 15,
            },
          ],
        },
        {
          code: "UAS",
          totalGradingWeight: 17,
          gradingSystem: [
            {
              gradingName: "Presensi",
              gradingWeight: 2,
            },
            {
              gradingName: "UAS",
              gradingWeight: 15,
            },
          ],
        },
      ],
      mainReferences: [
        "1. Fundamentals of Business Process Management, Marlon Dumas, 2018",
        "2. Business Re-engineering Process: Business Re-engineering Process analyses and design the workflows and business processes within an organization 2020",
      ],
      supportingReferences: [
        "1. Business Analysis and Process Modeling Guidebook: Business Analysis Techniques and Business Process Improvement",
        "2. Various journals https://www.forbes.com/sites/chunkamui/2012/01/18/how-kodak-failed/?sh=1706f0c46f27 https://hbr.org/2016/07/kodaks-downfall-wasnt-about-technology https://changemanagementinsight.com/johnson-and-johnson-crisis-management-case-study/",
      ],
      software: "Arena Simulation Software",
      hardware: "Komputer/Laptop; Projector",
      teamTeaching: ["Andrew Tanny Liem., SSi., MT., PhD"],
      minPassStudents: "50.01",
      minPassGrade: "85.00%",
      meetingPlan: [
        {
          week: "1",
          cpmkList: ["CPMK01"],
          subCpmkDescription:
            "Topik: BPR and Organization Mahasiswa mampu menjelaskan berbagai pendekatan BPR dan menjelaskan dampaknya terhadap desain model bisnis Mahasiswa memahami perubahan organisasi yang diperlukan untuk mendukung upaya BPR",
          achievementIndicators:
            "Tugas 1: Ketepatan mahasiswa dalam menjelaskan konsep dasar BPR Kuis 1: Ketepatan mahasiswa dalam menjawab kuis",
          assessmentModel: "Kuis, Case Study",
          material:
            "BPR and Organization #1: Definisi dari Re-Engineering, process dan proses bisnis. Definisi dan contoh dari BPR BPR and Organization #2: Bagaimana BPR dapat di implementasikan pada suatu Organisasi BPR and Organization #3: Karateristik dan Tujuan/Objektif dari BPR BPR and Organization #3: Metodologi untuk mengimplementasikan BPR dan teknik-teknik lain yang dapat digunakan",
          method:
            "Ceramah dan Diskusi TM: 2x(3x50’) Case Study 1 Mazda vs. Ford Case: Memahami dampak BPR terhadap desain model bisnis dan perubahan yang disebabkan BM:2x(3x60’) BT:2x(3x60’)",
          offlineActivity:
            "Mengikuti perkulihan tatap muka Penjelasan materi Menanyakan materi yang belum jelas ke dosen diskusi dan tanya jawab",
          onlineActivity:
            "Mengikuti perkulihan tatap muka Penjelasan materi Menanyakan materi yang belum jelas ke dosen diskusi dan tanya jawab",
        },
      ],
      studentAssignmentPlan: [
        {
          title: "Case Study 1 : Mazda vs Ford",
          assignmentModel: "Ex.Tugas 2: Journal Reading Reflection",
          references: "Buku Yuhu halamn 2",
          subLearningOutcomes:
            "Matakuliah ini mengajarkan pentingnya Business Process Reengineering (BPR) dalam konteks bisnis modern...",
          assignmentDescription:
            "Matakuliah ini mengajarkan pentingnya Business Process Reengineering (BPR) dalam konteks bisnis modern, dengan fokus",
          icbValuation:
            "Matakuliah ini mengajarkan pentingnya Business Process Reengineering (BPR) dalam konteks bisnis modern, dengan fokus",
          dueSchedule: "Senin 27 Agustus 2027 jam 10",
          others: "huhi",
          referenceList: "huhi",
        },
      ],
    });
    const resRps = await app.request("/api/rps", {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const rps = await resRps.json();
    gradingSystemId = rps.data.CpmkGrading[0].GradingSystem[0].id;
    rpsId = rps.data.id;

    // add student to RPS
    const pathStudent = "./tests/testFiles/ClassMember - example.xlsx";
    const fileStudent = Bun.file(pathStudent);
    const formDataStudent = new FormData();
    formDataStudent.append("file", fileStudent);
    const resStudent = await app.request(`/api/rps/${rpsId}/member`, {
      method: "POST",
      body: formDataStudent,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await resStudent.json();

    // get all student in target rps
    const students = await prisma.classStudent.findMany({
      where: {
        rpsId,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

describe("PUT /api/student-grade/:gradingSystemId", () => {
  const path = "./tests/testFiles/Insert Grade - example.xlsx";
  const file = Bun.file(path);
  it("should return 404 when the grading system not found", async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await app.request(
      `/api/student-grade/${gradingSystemId}-not-found`,
      {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(res.status).toBe(404);
  });

  const conditions = [
    { file: Bun.file("./tests/testFiles/Curriculum Cpl IF - example.xlsx") },
    { file: "" },
    {},
  ];
  it.each(conditions)(
    "should return 400 when the file is invalid",
    async (data) => {
      const formData = new FormData();
      data.file && formData.append("file", data.file);
      const res = await app.request(
        `/api/student-grade/${gradingSystemId}-not-found`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(res.status).toBe(400);
    }
  );

  it("should return 404 when unkown student is on the list", async () => {
    const path =
      "./tests/testFiles/Insert Grade - example(unknown-student).xlsx";
    const file = Bun.file(path);
    const formData = new FormData();
    formData.append("file", file);
    const res = await app.request(`/api/student-grade/${gradingSystemId}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(404);
  });

  it("should return 200", async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await app.request(`/api/student-grade/${gradingSystemId}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(200);
  });
});
