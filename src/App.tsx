import React, { useState, useEffect, useRef, useCallback } from "react";
import bscs from "../data/bscs.json";
import bsit from "../data/bsit.json";
import bsis from "../data/bsis.json";
import axios from "axios";

import QrScanner from "qr-scanner";

type Student = {
	studentNo: string;
	name: string;
};

const App: React.FC = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [studentId, setStudentId] = useState<string | null>(null);
	const [studentInfo, setStudentInfo] = useState<string>("");

	useEffect(() => {
		let qrScanner: QrScanner;

		QrScanner.hasCamera().then(() => {
			if (!videoRef.current) return;

			qrScanner = new QrScanner(
				videoRef.current,
				(result: QrScanner.ScanResult) => {
					if (result) {
						setStudentId(result.data);
					}
				},
				{
					returnDetailedScanResult: true,
					preferredCamera: 1,
					highlightScanRegion: true,
					maxScansPerSecond: 3,
					singleChannel: false,
					calculateScanRegion: (v: HTMLVideoElement) => {
						const heightRegionSize = Math.round(
							0.7 * Math.min(v.videoWidth, v.videoHeight)
						);
						//region size determines the size of
						//the border within the camera
						const widthRegionSize = Math.round(0.4 * v.videoWidth);

						const region: QrScanner.ScanRegion = {
							x: Math.round((v.videoWidth - widthRegionSize) / 2),
							y: Math.round((v.videoHeight - heightRegionSize) / 2),
							width: widthRegionSize,
							height: heightRegionSize,
						};

						return region;
					},
				}
			);

			qrScanner.start();

			return () => {
				if (qrScanner) qrScanner.destroy();
			};
		});
	}, []);

	// const persistStudentInfo = useCallback(async (studentInfo: string) => {
	// 	await fetch("https://localhost:3001/", {
	// 		method: "POST",
	// 		body: JSON.stringify({ studentInfo }),
	// 	}).then((res) => {
	// 		console.log(res);
	// 	});
	// });

	const filterStudent = () => {
		const bscsStudent = bscs.find(
			(student: Student) => student.studentNo === studentId
		);
		const bsitStudent = bsit.find(
			(student: Student) => student.studentNo === studentId
		);
		const bsisStudent = bsis.find(
			(student: Student) => student.studentNo === studentId
		);

		if (bscsStudent) {
			setStudentInfo(bscsStudent.name);
		} else if (bsitStudent) {
			setStudentInfo(bsitStudent.name);
		} else if (bsisStudent) {
			setStudentInfo(bsisStudent.name);
		} else {
			setStudentInfo("Student not found");
		}
	};

	const persistInfo = useCallback(
		async (studentId: string, studentInfo: string) => {
			console.log;
			try {
				const response = await fetch("http://localhost:3000/api/persist", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						stud_id: studentId,
						name: studentInfo,
					}),
				});
				const data = await response.json();
				alert(data.message);
			} catch (error) {
				console.error(error);
			}
		},
		[studentId, studentInfo]
	);

	useEffect(() => {
		//search to all json

		//if found, display the name of the student

		//if not found, display "Student not found"
		filterStudent();

		persistInfo(studentId!, studentInfo!);
	}, [studentId, studentInfo]);

	return (
		<div>
			<h1 className='font-bold'>QR Scanner Implementation</h1>
			<video ref={videoRef}></video>
			<h1 className='font-bold text-2xl'>
				Student Id: {studentId ? studentId : "Scanning..."}
			</h1>
			<h1>Student Name: {studentInfo}</h1>
		</div>
	);
};

export default App;
