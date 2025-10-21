// import { useEffect, useState } from "react";
// import { Button, Modal, Form, Tabs, Tab } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";

// export default function MyTasks() {
//   const [tasks, setTasks] = useState([]);
//   const [bids, setBids] = useState([]);
//   const [assignedTasks, setAssignedTasks] = useState([]);

//   // ---------- Task Modals ----------
//   const [selectedTaskBids, setSelectedTaskBids] = useState([]);
//   const [showBidsModal, setShowBidsModal] = useState(false);

//   const [deleteTaskId, setDeleteTaskId] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editTask, setEditTask] = useState({
//     id: null,
//     title: "",
//     description: "",
//     category: "",
//     creditsOffered: 0,
//     deadline: "",
//     status: "OPEN",
//   });

//   // ---------- Assigned Task Modal ----------
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);

//   // ---------- Bids ----------
//   const [editBid, setEditBid] = useState({
//     id: null,
//     credits: 0,
//     description: "",
//     estimatedDays: 0,
//   });
//   const [showEditBidModal, setShowEditBidModal] = useState(false);
//   const [deleteBidId, setDeleteBidId] = useState(null);
//   const [showDeleteBidModal, setShowDeleteBidModal] = useState(false);

//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");

//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };

//   // ---------- Fetch Functions ----------
//   const fetchTasks = async () => {
//     if (!user || !token) {
//       alert("You must be logged in to view your tasks.");
//       navigate("/login");
//       return;
//     }
//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/tasks/user/${user.id}`,
//         { headers }
//       );
//       const data = await res.json();
//       setTasks(data);
//     } catch (err) {
//       console.error("Failed to fetch tasks", err);
//     }
//   };

//   const fetchBids = async () => {
//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/bids/user/${user.id}`,
//         { headers }
//       );
//       const data = await res.json();
//       setBids(data);
//     } catch (err) {
//       console.error("Failed to fetch bids", err);
//     }
//   };

//   const fetchAssignedTasks = async () => {
//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/tasks/user/${user.id}/assigned-tasks`,
//         { headers }
//       );
//       const data = await res.json();
//       setAssignedTasks(data);
//     } catch (err) {
//       console.error("Failed to fetch assigned tasks", err);
//     }
//   };

//   useEffect(() => {
//     fetchTasks();
//     fetchBids();
//     fetchAssignedTasks();
//   }, []);

//   // ---------- Task Handlers ----------
//   const handleEditClick = (task) => {
//     setEditTask({ ...task });
//     setShowEditModal(true);
//   };

//   const handleEditChange = (e) => {
//     setEditTask({ ...editTask, [e.target.name]: e.target.value });
//   };

//   const saveEdit = async () => {
//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/tasks/${editTask.id}`,
//         {
//           method: "PUT",
//           headers,
//           body: JSON.stringify(editTask),
//         }
//       );
//       if (res.ok) {
//         alert("Task updated successfully!");
//         setShowEditModal(false);
//         fetchTasks();
//       } else alert("Failed to update task");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update task");
//     }
//   };

//   const handleDeleteClick = (taskId) => {
//     setDeleteTaskId(taskId);
//     setShowDeleteModal(true);
//   };

//   const confirmDelete = async () => {
//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/tasks/${deleteTaskId}`,
//         {
//           method: "DELETE",
//           headers,
//         }
//       );
//       if (res.ok) {
//         alert("Task deleted successfully!");
//         setShowDeleteModal(false);
//         fetchTasks();
//       } else alert("Failed to delete task");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete task");
//     }
//   };

//   // ---------- Bid Handlers ----------
//   const handleEditBidClick = (bid) => {
//     setEditBid({ ...bid });
//     setShowEditBidModal(true);
//   };

//   const handleEditBidChange = (e) => {
//     setEditBid({ ...editBid, [e.target.name]: e.target.value });
//   };

//   const saveBidEdit = async () => {
//     try {
//       const res = await fetch(`http://localhost:8080/api/bids/${editBid.id}`, {
//         method: "PUT",
//         headers,
//         body: JSON.stringify(editBid),
//       });
//       if (res.ok) {
//         alert("Bid updated successfully!");
//         setShowEditBidModal(false);
//         fetchBids();
//       } else alert("Failed to update bid");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update bid");
//     }
//   };

//   const handleDeleteBidClick = (bidId) => {
//     setDeleteBidId(bidId);
//     setShowDeleteBidModal(true);
//   };

//   const confirmDeleteBid = async () => {
//     try {
//       const res = await fetch(`http://localhost:8080/api/bids/${deleteBidId}`, {
//         method: "DELETE",
//         headers,
//       });
//       if (res.ok) {
//         alert("Bid deleted successfully!");
//         setShowDeleteBidModal(false);
//         fetchBids();
//       } else alert("Failed to delete bid");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete bid");
//     }
//   };

//   // ---------- Assigned Tasks Actions ----------
//   const handleStartTask = async (taskId) => {
//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/tasks/${taskId}/status`,
//         {
//           method: "PUT",
//           headers,
//           body: JSON.stringify({ status: "IN_PROGRESS" }),
//         }
//       );
//       if (res.ok) {
//         setAssignedTasks((prev) =>
//           prev.map((task) =>
//             task.id === taskId ? { ...task, status: "IN_PROGRESS" } : task
//           )
//         );
//       } else alert("Failed to start task");
//     } catch (err) {
//       console.error(err);
//       alert("Error starting task");
//     }
//   };

//   const handleViewTask = (task) => {
//     setSelectedTask(task);
//     setShowDetailsModal(true);
//   };

//   // ---------- Allocate Bid ----------
//   const handleSelectBid = async (bid) => {
//     try {
//       const token = localStorage.getItem("token");
//       const headers = {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       };

//       const res = await fetch(
//         `http://localhost:8080/api/bids/tasks/${bid.taskId}/allocate/${bid.id}`,
//         { method: "POST", headers }
//       );

//       if (res.ok) {
//         const updatedTask = await res.json(); // get the updated task
//         alert(`Bid allocated to ${bid.bidderName} successfully!`);

//         // Update frontend state immediately
//         setTasks((prevTasks) =>
//           prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
//         );

//         setShowBidsModal(false);
//         fetchAssignedTasks(); // fetch latest assigned tasks if needed
//       } else {
//         const err = await res.json();
//         console.error("Allocation failed:", err);
//         alert("Failed to allocate bid: " + (err.message || "Unknown error"));
//       }
//     } catch (err) {
//       console.error("Error allocating bid:", err);
//       alert("Error allocating bid");
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2 className="mb-4 text-center">My Dashboard</h2>

//       <Tabs defaultActiveKey="tasks" id="my-tasks-tabs" className="mb-3">
//         {/* ---------------- Tasks Posted by Me ---------------- */}
//         <Tab eventKey="tasks" title="Tasks Posted by Me">
//           <div className="table-responsive">
//             <table className="table table-bordered table-hover text-center">
//               <thead>
//                 <tr>
//                   <th>Title</th>
//                   <th>Description</th>
//                   <th>Category</th>
//                   <th>Credits</th>
//                   <th>Deadline</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {tasks.map((task) => (
//                   <tr key={task.id}>
//                     <td>{task.title}</td>
//                     <td>{task.description}</td>
//                     <td>{task.category}</td>
//                     <td>{task.creditsOffered}</td>
//                     <td>{task.deadline}</td>
//                     <td>{task.status}</td>
//                     <td>
//                       {/* View Bids Button */}
//                       <Button
//                         variant="info"
//                         size="sm"
//                         className="me-2"
//                         onClick={async () => {
//                           try {
//                             const res = await fetch(
//                               `http://localhost:8080/api/bids/tasks/${task.id}`,
//                               { headers }
//                             );
//                             const data = await res.json();
//                             setSelectedTaskBids(
//                               data.map((b) => ({ ...b, taskId: task.id }))
//                             );
//                             setShowBidsModal(true);
//                           } catch (err) {
//                             console.error("Failed to fetch bids", err);
//                             alert("Failed to fetch bids for this task");
//                           }
//                         }}
//                       >
//                         View Bids
//                       </Button>

//                       {/* Edit & Delete Buttons */}
//                       <Button
//                         variant="warning"
//                         size="sm"
//                         className="me-2"
//                         onClick={() => handleEditClick(task)}
//                         disabled={task.status === "ALLOCATED"}
//                       >
//                         Edit
//                       </Button>
//                       <Button
//                         variant="danger"
//                         size="sm"
//                         onClick={() => handleDeleteClick(task.id)}
//                         disabled={task.status === "ALLOCATED"}
//                       >
//                         Delete
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </Tab>

//         {/* ---------------- Bids Placed by Me ---------------- */}
//         <Tab eventKey="bids" title="Bids Placed by Me">
//           <div className="table-responsive">
//             <table className="table table-bordered table-hover text-center">
//               <thead>
//                 <tr>
//                   <th>Task</th>
//                   <th>Credits Offered</th>
//                   <th>Description</th>
//                   <th>Estimated Days</th>
//                   {/* <th>Bid ID</th> */}
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {bids.map((bid) => (
//                   <tr key={bid.id}>
//                     <td>{bid.taskTitle}</td>
//                     <td>{bid.credits}</td>
//                     <td>{bid.description}</td>
//                     <td>{bid.estimatedDays}</td>
//                     {/* <td>{bid.id}</td> */}
//                     <td>
//                       <Button
//                         variant="warning"
//                         size="sm"
//                         className="me-2"
//                         onClick={() => handleEditBidClick(bid)}
//                         disabled={bid.taskStatus === "ALLOCATED"}
//                       >
//                         Edit
//                       </Button>
//                       <Button
//                         variant="danger"
//                         size="sm"
//                         disabled={bid.taskStatus === "ALLOCATED"}
//                         onClick={() => handleDeleteBidClick(bid.id)}
//                       >
//                         Delete
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </Tab>

//         {/* ---------------- Assigned Tasks ---------------- */}
//         <Tab eventKey="assigned" title="Assigned Tasks">
//           <div className="table-responsive">
//             <table className="table table-bordered table-hover text-center">
//               <thead>
//                 <tr>
//                   <th>Title</th>
//                   <th>Category</th>
//                   <th>Credits</th>
//                   <th>Deadline</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {assignedTasks.length > 0 ? (
//                   assignedTasks.map((task) => (
//                     <tr key={task.id}>
//                       <td>{task.title}</td>
//                       <td>{task.category}</td>
//                       <td>{task.creditsOffered}</td>
//                       <td>{task.deadline}</td>
//                       <td>{task.status}</td>
//                       <td>
//                         {/* ---------- Start Task Button ---------- */}
//                         {task.status === "ALLOCATED" && (
//                           <Button
//                             variant="primary"
//                             size="sm"
//                             onClick={() => handleStartTask(task.id)}
//                           >
//                             Start Task
//                           </Button>
//                         )}

//                         {/* ---------- Submit Task Button ---------- */}
//                         {task.status === "IN_PROGRESS" && (
//                           <>
//                             {!task.showSubmitBox && (
//                               <Button
//                                 variant="warning"
//                                 size="sm"
//                                 onClick={() =>
//                                   setAssignedTasks((prev) =>
//                                     prev.map((t) =>
//                                       t.id === task.id
//                                         ? { ...t, showSubmitBox: true }
//                                         : t
//                                     )
//                                   )
//                                 }
//                               >
//                                 Submit Task
//                               </Button>
//                             )}

//                             {/* ---------- Inline Box + Mark Complete ---------- */}
//                             {task.showSubmitBox && (
//                               <div className="d-flex align-items-center">
//                                 <Form.Control
//                                   type="text"
//                                   placeholder="Enter remarks"
//                                   value={task.remarks || ""}
//                                   onChange={(e) =>
//                                     setAssignedTasks((prev) =>
//                                       prev.map((t) =>
//                                         t.id === task.id
//                                           ? { ...t, remarks: e.target.value }
//                                           : t
//                                       )
//                                     )
//                                   }
//                                   className="me-2"
//                                 />
//                                 <Button
//                                   variant="success"
//                                   size="sm"
//                                   onClick={async () => {
//                                     try {
//                                       const res = await fetch(
//                                         `http://localhost:8080/api/tasks/${task.id}/status`,
//                                         {
//                                           method: "PUT",
//                                           headers,
//                                           body: JSON.stringify({
//                                             status: "COMPLETED",
//                                           }),
//                                         }
//                                       );
//                                       if (res.ok) {
//                                         setAssignedTasks((prev) =>
//                                           prev.map((t) =>
//                                             t.id === task.id
//                                               ? {
//                                                   ...t,
//                                                   status: "COMPLETED",
//                                                   showSubmitBox: false,
//                                                 }
//                                               : t
//                                           )
//                                         );
//                                       } else
//                                         alert("Failed to mark task complete");
//                                     } catch (err) {
//                                       console.error(err);
//                                       alert("Error marking task complete");
//                                     }
//                                   }}
//                                 >
//                                   Mark as Complete
//                                 </Button>
//                               </div>
//                             )}
//                           </>
//                         )}

//                         {/* ---------- View Details Button ---------- */}
//                         <Button
//                           variant="info"
//                           size="sm"
//                           className="ms-2"
//                           onClick={() => handleViewTask(task)}
//                         >
//                           View Details
//                         </Button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="6">No tasks assigned to you.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </Tab>
//       </Tabs>

//       {/* ---------------- Modals ---------------- */}

//       {/* ---------- View Bids Modal ---------- */}
//       <Modal
//         show={showBidsModal}
//         onHide={() => setShowBidsModal(false)}
//         size="lg"
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Bids for Task</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedTaskBids.length > 0 ? (
//             <table className="table table-bordered text-center">
//               <thead>
//                 <tr>
//                   <th>Bidder</th>
//                   <th>Credits</th>
//                   <th>Description</th>
//                   <th>Estimated Days</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {selectedTaskBids.map((bid) => (
//                   <tr key={bid.id}>
//                     <td>{bid.bidderName}</td>
//                     <td>{bid.credits}</td>
//                     <td>{bid.description}</td>
//                     <td>{bid.estimatedDays}</td>
//                     <td>
//                       <Button
//                         variant="success"
//                         size="sm"
//                         disabled={
//                           tasks.find((t) => t.id === bid.taskId)?.status ===
//                           "ALLOCATED"
//                         }
//                         onClick={() => handleSelectBid(bid)}
//                       >
//                         Select
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p className="text-center">No bids for this task</p>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowBidsModal(false)}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* ---------- Task Details Modal ---------- */}
//       <Modal
//         show={showDetailsModal}
//         onHide={() => setShowDetailsModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Task Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedTask ? (
//             <>
//               <p>
//                 <strong>Title:</strong> {selectedTask.title}
//               </p>
//               <p>
//                 <strong>Description:</strong> {selectedTask.description}
//               </p>
//               <p>
//                 <strong>Category:</strong> {selectedTask.category}
//               </p>
//               <p>
//                 <strong>Credits:</strong> {selectedTask.creditsOffered}
//               </p>
//               <p>
//                 <strong>Deadline:</strong> {selectedTask.deadline}
//               </p>
//               <p>
//                 <strong>Status:</strong> {selectedTask.status}
//               </p>
//             </>
//           ) : (
//             <p>No task selected.</p>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowDetailsModal(false)}
//           >
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* ---------- Edit Task Modal ---------- */}
//       <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Task</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             {[
//               "title",
//               "description",
//               "category",
//               "creditsOffered",
//               "deadline",
//               "status",
//             ].map((field) => (
//               <Form.Group key={field} className="mb-3">
//                 <Form.Label>
//                   {field.charAt(0).toUpperCase() + field.slice(1)}
//                 </Form.Label>
//                 {field === "description" ? (
//                   <Form.Control
//                     as="textarea"
//                     rows={3}
//                     name={field}
//                     value={editTask[field]}
//                     onChange={handleEditChange}
//                   />
//                 ) : field === "status" ? (
//                   <Form.Select
//                     name="status"
//                     value={editTask.status}
//                     onChange={handleEditChange}
//                   >
//                     <option value="PENDING">PENDING</option>
//                     <option value="OPEN">OPEN</option>
//                     <option value="ALLOCATED">ALLOCATED</option>
//                     <option value="IN_PROGRESS">IN_PROGRESS</option>
//                     <option value="COMPLETED">COMPLETED</option>
//                     <option value="CANCELLED">CANCELLED</option>
//                   </Form.Select>
//                 ) : (
//                   <Form.Control
//                     type={
//                       field === "creditsOffered"
//                         ? "number"
//                         : field === "deadline"
//                         ? "date"
//                         : "text"
//                     }
//                     name={field}
//                     value={editTask[field]}
//                     onChange={handleEditChange}
//                   />
//                 )}
//               </Form.Group>
//             ))}
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowEditModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={saveEdit}>
//             Save
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* ---------- Delete Task Modal ---------- */}
//       <Modal
//         show={showDeleteModal}
//         onHide={() => setShowDeleteModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Delete</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>Are you sure you want to delete this task?</Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={confirmDelete}>
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* ---------- Edit Bid Modal ---------- */}
//       <Modal show={showEditBidModal} onHide={() => setShowEditBidModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Bid</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             {["credits", "description", "estimatedDays"].map((field) => (
//               <Form.Group key={field} className="mb-3">
//                 <Form.Label>
//                   {field.charAt(0).toUpperCase() + field.slice(1)}
//                 </Form.Label>
//                 <Form.Control
//                   type={
//                     field === "credits" || field === "estimatedDays"
//                       ? "number"
//                       : "text"
//                   }
//                   name={field}
//                   value={editBid[field]}
//                   onChange={handleEditBidChange}
//                 />
//               </Form.Group>
//             ))}
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowEditBidModal(false)}
//           >
//             Cancel
//           </Button>
//           <Button variant="success" onClick={saveBidEdit}>
//             Save
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* ---------- Delete Bid Modal ---------- */}
//       <Modal
//         show={showDeleteBidModal}
//         onHide={() => setShowDeleteBidModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Delete</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>Are you sure you want to delete this bid?</Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowDeleteBidModal(false)}
//           >
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={confirmDeleteBid}>
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// }