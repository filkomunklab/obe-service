const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // CREATE ADMIN
  await prisma.admin.create({
    data: {
      email: "admin@mail.com",
      username: "admin",
      password: "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      role: "ADMIN",
    },
  });

  // CREATE SUPER_ADMIN
  await prisma.admin.create({
    data: {
      email: "super_admin@mail.com",
      username: "superadmin",
      password: "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      role: "SUPER_ADMIN",
    },
  });

  // CREATE ADMIN_LPMI
  await prisma.admin.create({
    data: {
      email: "admin_lpmi@mail.com",
      username: "adminlpmi",
      password: "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      role: "ADMIN_LPMI",
    },
  });

  // CREATE DOSEN SKRIPSI, KAPRODI IF
  await prisma.employee
    .create({
      data: {
        Address: "Manado",
        email: "mandias@test.com",
        phoneNum: "081234567890",
        firstName: "Green",
        lastName: "Mandias",
        degree: "SKom, MCs",
        nik: "1001",
        nidn: "0904028101",
        major: "IF",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK", "KAPRODI"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN SKRIPSI, KAPRODI SI
  await prisma.employee
    .create({
      data: {
        Address: "Manado",
        phoneNum: "081234567891",
        email: "pungus@test.com",
        firstName: "Stenly",
        lastName: "Pungus",
        degree: "MT, PhD",
        nik: "1002",
        nidn: "0922098101",
        major: "SI",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK", "KAPRODI"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DEKAN
  await prisma.employee
    .create({
      data: {
        Address: "Manado",
        phoneNum: "081234567892",
        email: "liem@test.com",
        firstName: "Andrew Tanny",
        lastName: "Liem",
        degree: "MT, PhD",
        nik: "1003",
        nidn: "0916038101",
        major: "IF",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK", "DEKAN"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 1
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567893",
        email: "adam@test.com",
        firstName: "Stenly Ibrahim ",
        lastName: "Adam",
        degree: " SKom, MSc",
        nik: "1004",
        nidn: " 0915098707",
        major: "SI",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 2
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567894",
        email: "moedjahedy@test.com",
        firstName: "Jimmy Herawan",
        lastName: "Moedjahedy ",
        degree: " SKom, MKom, MM",
        nik: "1005",
        nidn: "0923128602",
        major: "SI",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 3
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567895",
        email: "lengkong@test.com",
        firstName: "Oktoverano Hendrik",
        lastName: "Lengkong",
        degree: " SKom, MDs, MM",
        nik: "1006",
        nidn: " 0912108301",
        major: "DKV",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK", "KAPRODI"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 4
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567801",
        email: "greensandag@test.com",
        firstName: "Green Arther",
        lastName: "Sandag",
        degree: " SKom, MDs, MM",
        nik: "1007",
        nidn: "0907129001",
        major: "IF",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 5
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567802",
        email: "debysondakh@test.com",
        firstName: "Debby Erce",
        lastName: "Sondakh",
        degree: " SKom, MDs, MM",
        nik: "1008",
        nidn: "0926128001",
        major: "IF",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 6
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567803",
        email: "jacqulinewaworundeng@test.com",
        firstName: "Jacquline",
        lastName: "Waworundeng",
        degree: " SKom, MDs, MM",
        nik: "1009",
        nidn: "0904118303",
        major: "IF",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 7
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567804",
        email: "edsonputra@test.com",
        firstName: "Edson Yahuda",
        lastName: "Putra",
        degree: " SKom, MDs, MM",
        nik: "1010",
        nidn: " 0011106901",
        major: "IF",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 8
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567805",
        email: "marcheltombeng@test.com",
        firstName: "Marchel Timothy",
        lastName: "Tombeng",
        degree: " SKom, MDs, MM",
        nik: "1011",
        nidn: "2330038801",
        major: "IF",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 9
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567806",
        email: "andriawahyudi@test.com",
        firstName: "Andria Kusuma",
        lastName: "Wahyudi",
        degree: " SKom, MDs, MM",
        nik: "1012",
        nidn: "0916088901",
        major: "IF",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 10
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567807",
        email: "lidyalaoh@test.com",
        firstName: "Lidya Chitra",
        lastName: "Laoh",
        degree: " SKom, MDs, MM",
        nik: "1013",
        nidn: "0929038001",
        major: "IF",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 11
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567808",
        email: "joemambu@test.com",
        firstName: "Joe Yuan Yulian",
        lastName: "Mambu",
        degree: " SKom, MDs, MM",
        nik: "1014",
        nidn: "0927078306",
        major: "SI",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 12
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567809",
        email: "reynoldussahulata@test.com",
        firstName: "Reynoldus Andrias",
        lastName: "Sahulata",
        degree: " SKom, MDs, MM",
        nik: "1015",
        nidn: "0311106605",
        major: "SI",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 13
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567810",
        email: "semmytaju@test.com",
        firstName: "Semmy Wellem",
        lastName: "Taju",
        degree: " SKom, MDs, MM",
        nik: "1016",
        nidn: "1604098901",
        major: "SI",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 14
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567811",
        email: "rollylontaan@test.com",
        firstName: "Rolly Junius",
        lastName: "Lontaan",
        degree: " SKom, MDs, MM",
        nik: "1017",
        nidn: "1626068101",
        major: "SI",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 15
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567812",
        email: "stevenlolong@test.com",
        firstName: "Steven",
        lastName: "Lolong",
        degree: " SKom, MDs, MM",
        nik: "1018",
        nidn: "0922098001",
        major: "SI",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // CREATE DOSEN 16
  await prisma.employee
    .create({
      data: {
        Address: "Airmadidi",
        phoneNum: "081234567813",
        email: "jeinrewah@test.com",
        firstName: "Jein",
        lastName: "Rewah",
        degree: " SKom, MDs, MM",
        nik: "1019",
        nidn: "0917018303",
        major: "SI",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      // Daftar peran yang akan Anda tambahkan pada dosen
      const rolesToAdd = ["DOSEN", "DOSEN_MK"];

      // Membuat entri UserRole untuk setiap peran
      for (const role of rolesToAdd) {
        await prisma.userRole.create({
          data: {
            userId: employee.id,
            role: role,
          },
        });
      }
    });

  // ===================================================================================
  // CREATE SEKRETARIS
  await prisma.employee
    .create({
      data: {
        Address: "Manado",
        phoneNum: "081234567896",
        email: "kainde@test.com",
        firstName: "Wilma",
        lastName: "Kainde",
        nik: "1020",
        password:
          "$2b$10$8i4.tmBGcK619R.lL6goi.GBRA3E7y25fARKYRqIPR46PjwlPV9eu",
      },
    })
    .then(async (employee) => {
      await prisma.userRole.create({
        data: {
          userId: employee.id,
          role: "OPERATOR_FAKULTAS",
        },
      });
    });
}

main()
  .catch(async (e) => {
    console.log(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
