export default function createRpsData(
  teacherId: string,
  subjectId: string,
  supportedCplIds: string[]
) {
  return {
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
  };
}
