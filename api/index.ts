import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import Pool from "pg";

dotenv.config();

// type Student = {
// 	student_id: string;
// 	name: string;
// };

const app = express();
app.use(express.json());
app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);

//instantiate pool to establish connection to postgresql database
const qrDb = new Pool.Pool({
	user: "postgres",
	host: "localhost",
	database: "qr-test",
	password: "garuda06242008",
	port: 5432,
});

qrDb.connect().then(() => console.log("Connected to database"));

app.post("/api/persist", async (req: Request, res: Response) => {
	const { stud_id, name } = req.body;

	try {
		const findStudent = await qrDb.query(
			`SELECT * FROM tbl_student WHERE stud_id = '${stud_id}'`
		);

		if (findStudent.rows.length > 0) {
			const ifExist = findStudent.rows.find(
				(student) => student.stud_id === stud_id
			);

			if (ifExist) {
				return res.status(400).json({
					message: "Student already exist",
					student: ifExist,
				});
			}
		}

		const newStudent = await qrDb.query(
			`INSERT INTO tbl_student (stud_id, name) VALUES ('${stud_id}', '${name}') RETURNING *`
		);

		res.status(200).json({
			message: "Student added successfully",
			student: newStudent.rows[0],
		});
	} catch (err) {
		res.status(500).json({ err, message: "Something went wrong" });
	}
});

app.listen(3000, () => console.log(`Server is running on port 3000`));
