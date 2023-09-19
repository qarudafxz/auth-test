import React, { useState, useEffect, useRef, useCallback } from "react";
import QrScanner from "qr-scanner";
import bscs from "../data/bscs.json";
import bsit from "../data/bsit.json";
import bsis from "../data/bsis.json";

// type Student = {
// 	studentNo: string;
// 	name: string;
// };

const App: React.FC = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [studentId, setStudentId] = useState<string | null>(null);
	const [studentInfo, setStudentInfo] = useState<string>("");

	useEffect(() => {
		let qrScanner: QrScanner;

		const initializeScanner = async () => {
			try {
				await QrScanner.hasCamera();
				if (videoRef.current) {
					qrScanner = new QrScanner(videoRef.current, handleScanResult, {
						returnDetailedScanResult: true,
						preferredCamera: 1,
						highlightScanRegion: true,
						maxScansPerSecond: 3,
						singleChannel: false,
						calculateScanRegion: (v: HTMLVideoElement) => {
							const heightRegionSize = Math.round(
								0.7 * Math.min(v.videoWidth, v.videoHeight)
							);
							const widthRegionSize = Math.round(0.4 * v.videoWidth);
							const region: QrScanner.ScanRegion = {
								x: Math.round((v.videoWidth - widthRegionSize) / 2),
								y: Math.round((v.videoHeight - heightRegionSize) / 2),
								width: widthRegionSize,
								height: heightRegionSize,
							};
							return region;
						},
					});
					qrScanner.start();
				}
			} catch (error) {
				console.error("Error initializing scanner:", error);
			}

			return () => {
				if (qrScanner) qrScanner.destroy();
			};
		};

		initializeScanner();
	}, []);

	const handleScanResult = (result: QrScanner.ScanResult) => {
		if (result) {
			setStudentId(result.data);
		}
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const filterStudent = async () => {
		const students = [...bscs, ...bsis, ...bsit];

		//find the student based by the variable state studentId
		students.forEach((student) => {
			if (student.studentNo === studentId) {
				console.log("Student found: ", student.name);
				setStudentInfo(student.name);
			}
		});
	};

	const persistInfo = useCallback(
		async (studentId: string, studentInfo: string) => {
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
				console.error("Error while persisting info:", error);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[studentId, studentInfo]
	);

	useEffect(() => {
		if (studentId) filterStudent();
		if (studentId && studentInfo) persistInfo(studentId, studentInfo);
	}, [studentId, studentInfo]);

	return (
		<div>
			<div className='grid grid-cols-1 place-items-center mt-28'>
				<h1 className='font-bold'>QR Scanner Implementation</h1>
				<video ref={videoRef}></video>
				<h1 className='font-bold text-2xl'>
					Student Id: {studentId ? studentId : "Scanning..."}
				</h1>
				<h1>Student Name: {studentInfo}</h1>
			</div>
		</div>
	);
};

export default App;
