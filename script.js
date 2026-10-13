// ==========================================
// 1. ประกาศตัวแปรและข้อมูลตั้งต้น (Data & DOM Elements)
// ==========================================
let tasks = [
    
] ;

// ดึง element จากหน้า HTML มาเก็บไว้ใช้งาน
const taskListElement = document.querySelector( '#taskList' ) ;
const taskForm = document.querySelector( '#taskForm' ) ;
const taskInput = document.querySelector( '#taskInput' ) ;
const priorityInput = document.querySelector( '#priorityInput' ) ;


// ==========================================
// 2. ฟังก์ชันหลักสำหรับจัดการข้อมูล (Core Functions)
// ==========================================

// ฟังก์ชันแสดงรายการงานทั้งหมดทาง Terminal/Console
const displayTasks = ( ) => {

    console.log( "--- รายการงานทั้งหมด ---" ) ;

    tasks.forEach( task => {

        const status = task.completed ? "[x]" : "[ ]" ;

        console.log( `${status} ID: ${task.id}
${task.title} (ความสำคัญ: ${task.priority})` ) ;

    } ) ;

} ;

// ฟังก์ชันค้นหางานตาม ID
const getTaskById = ( id ) => {
    
    return tasks.find( task => task.id === id ) ;
    
} ;

// ฟังก์ชันกรองหางานด่วนที่ยังไม่เสร็จ
const getUrgentTasks = ( ) => {
    
    return tasks.filter( task => !task.completed && task.priority === "high" ) ;
    
} ;

// ฟังก์ชันดึงข้อมูลเฉพาะชื่อหัวข้องาน (title) ออกมาเป็น Array ใหม่
const getTaskTitles = ( ) => {
    
    return tasks.map( task => task.title ) ;
    
} ;

// ฟังก์ชันเพิ่มงานใหม่เข้าไปใน Array (เชื่อมต่อ Backend)
const addTask = async ( title, priority ) => {

    try {

        await fetch( 'https://task-backend-70ex.onrender.com/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // ต้องบอกเซิร์ฟเวอร์ว่าส่ง JSON ไป
            },
            body: JSON.stringify( { title: title, priority: priority } ) // แพ็คของลงกล่อง
        } ) ;

        // เมื่อเพิ่มที่ Backend เสร็จ สั่งดึงข้อมูลล่าสุดมาวาดใหม่
        fetchTasks( ) ;

    } catch ( error ) {

        console.error( "เพิ่มงานไม่สำเร็จ:", error ) ;

    }

} ;

// ฟังก์ชันสลับสถานะความสำเร็จของงาน (True / False) (เชื่อมต่อ Backend)
const toggleTaskStatus = async ( id ) => {

    try {

        await fetch( `https://task-backend-70ex.onrender.com/tasks/${id}`, {
            method: 'PUT'
        } ) ;

        fetchTasks( ) ; // ดึงข้อมูลใหม่

    } catch ( error ) {

        console.error( "เปลี่ยนสถานะไม่สำเร็จ:", error ) ;

    }

} ;

// ฟังก์ชันลบงานออกจากระบบตาม ID ที่กำหนด (เชื่อมต่อ Backend)
const deleteTask = async ( id ) => {

    try {

        await fetch( `https://task-backend-70ex.onrender.com/tasks/${id}`, {
            method: 'DELETE'
        } ) ;

        fetchTasks( ) ; // ดึงข้อมูลใหม่

    } catch ( error ) {

        console.error( "ลบงานไม่สำเร็จ:", error ) ;

    }

} ;


// ==========================================
// 3. ฟังก์ชันเรนเดอร์ UI บนหน้าเว็บไซต์ (Render UI)
// ==========================================

// ฟังก์ชันดึงข้อมูลจาก Server มาเก็บไว้ในตัวแปร tasks
const fetchTasks = async ( ) => {

    try {

        // ระหว่างรอข้อมูล ให้แสดงข้อความ Loading บนหน้าจอ
        taskListElement.innerHTML = "<p style='text-align: center;'>⏳ กำลังดึงข้อมูลจากเซิร์ฟเวอร์...</p>" ;

        // ใช้ fetch ไปขอข้อมูล และใส่ await เพื่อบอกให้ "รอจนกว่าข้อมูลจะมาถึง"
        const response = await fetch( 'https://task-backend-70ex.onrender.com/tasks' ) ;

        // แปลงผลลัพธ์ที่ได้ให้กลายเป็นออบเจกต์ JSON
        const data = await response.json( ) ;

        // นำข้อมูลที่ได้จากเซิร์ฟเวอร์ มาใส่ในตัวแปร tasks ของเรา
        tasks = data.map( item => {

            return {
                id: item._id,
                title: item.title,
                completed: item.completed,
                priority: item.priority || "low"
            } ;

        } ) ;

        // เมื่อข้อมูลพร้อมแล้ว สั่งให้วาดหน้าจอใหม่
        renderTasks( ) ;

    } catch ( error ) {

        // ถ้าเน็ตหลุด หรือ URL ผิด จะวิ่งเข้ามาที่นี่
        console.error( "เกิดข้อผิดพลาด:", error ) ;
        taskListElement.innerHTML = "<p style='text-align: center; color: red;'>❌ ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่</p>" ;

    }

} ;

const renderTasks = ( ) => {

    // ถ้าไม่มีงานเลย ให้แสดงข้อความแจ้งเตือน
    if ( tasks.length === 0 ) {

        taskListElement.innerHTML = "<p>🎉 เยี่ยมมาก! ไม่มีงานค้างเลย</p>" ;
        return ;

    }

    // นำข้อมูล Array มาแปลงเป็น HTML
    const htmlString = tasks.map( task => {

        // เช็คว่าถ้างานเสร็จแล้ว ให้ขีดฆ่าตัวหนังสือ
        const textStyle = task.completed ? "text-decoration: line-through; color: gray;" : "" ;

        return `
            <div class="task-card" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 5px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" onchange="handleToggle('${task.id}')" ${task.completed ? 'checked' : ''}>
                    <span style="${textStyle}">${task.title} <small>(${task.priority})</small></span>
                </div>
                <button onclick="handleDelete('${task.id}')" style="color: red; cursor: pointer; background: none; border: none;">ลบ</button>
            </div>
        ` ;

    } ).join( '' ) ;

    // นำก้อน HTML ไปใส่ในหน้าเว็บ
    taskListElement.innerHTML = htmlString ;

} ;


// ==========================================
// 4. ส่วนทดสอบการทำงานและการเรียกใช้งาน (Execution)
// ==========================================

// เพิ่มการดักจับเหตุการณ์ Submit (Event Listener)
taskForm.addEventListener( 'submit', ( event ) => {

    // ป้องกันไม่ให้เบราว์เซอร์รีเฟรชหน้าเว็บ (พฤติกรรมดั้งเดิมของฟอร์ม)
    event.preventDefault( ) ;

    // ดึงข้อความจากช่อง Input
    const newTitle = taskInput.value ;
    const newPriority = priorityInput.value ;

    // 1. เรียกใช้ฟังก์ชัน Business Logic
    addTask( newTitle, newPriority ) ;

    // 2. ล้างค่าในช่องกรอกข้อมูลให้ว่างเปล่า
    taskInput.value = '' ;

} ) ;

// ฟังก์ชันรับคำสั่งลบ
const handleDelete = ( id ) => {

    // เพื่อความปลอดภัย ควรถามยืนยันก่อนลบ
    if ( confirm( "คุณแน่ใจหรือไม่ที่จะลบงานนี้?" ) ) {

        deleteTask( id ) ; // เรียก Logic ลบข้อมูล

    }

} ;

// ฟังก์ชันรับคำสั่งเปลี่ยนสถานะ (ติ๊กถูก)
const handleToggle = ( id ) => {

    toggleTaskStatus( id ) ; // เรียก Logic สลับสถานะ

} ;

// เรียกใช้งานดึงข้อมูลจาก Server และวาดหน้าจอแสดงผลครั้งแรกเมื่อเปิดเว็บ
fetchTasks( ) ;