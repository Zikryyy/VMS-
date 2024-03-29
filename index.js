const { MongoClient } = require('mongodb');
const uri = "mongodb://zikry:J07k2rHmxnU5Y9CM@ac-zt9huex-shard-00-00.55dttni.mongodb.net:27017,ac-zt9huex-shard-00-01.55dttni.mongodb.net:27017,ac-zt9huex-shard-00-02.55dttni.mongodb.net:27017/?ssl=true&replicaSet=atlas-v8zu1w-shard-0&authSource=admin&retryWrites=true&w=majority";
const client = new MongoClient(uri);


var jwt = require('jsonwebtoken');
const privatekey = "kucingterbang";

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
});


const express = require('express');
const app = express();
const port = process.env.PORT || 3000; 

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'VMS API',
            version: '1.0.0'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }],
        tags: [
            { name: 'Admin', description: 'Operations related to admin' },
            { name: 'Security', description: 'Operations related to security' },
            { name: 'Staff', description: 'Operations related to staff' },
            { name: 'Visitors', description: 'Operations related to visitors' }
        ]
    },
    apis: ['./index.js'],
};


const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const bcrypt = require('bcryptjs');

app.use(express.json())

//Generate Hash for password
async function generateHash(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

async function registerStaff(identification_No, name, hashedPassword, phone_number) {
    const insertedStaff = await client.db("VMS").collection("UserInfo").insertOne({
        identification_No,
        name,
        password: hashedPassword,
        phone_number,
        role: "Staff"
    });
    return insertedStaff;
}

async function registerAdmin(identification_No, name, hashedPassword, phone_number) {
    const insertedAdmin = await client.db("VMS").collection("UserInfo").insertOne({
        identification_No,
        name,
        password: hashedPassword,
        phone_number,
        role: "Admin"
    });
    return insertedAdmin;
}

// register a visitor 
async function register(host, identification_No, name, gender, ethnicity, temperature, dateofbirth, citizenship, document_type, expiryDate, address, town, postcode, state, country, phone_number, vehicle_number, vehicle_type, visitor_category, preregistered_pass, no_of_visitors, date, time, purpose_of_visit, visit_limit_hrs, visit_limit_min, To_meet, Host_Information, Location_or_department, Unit_no, Location_Information, Permit_number, Delivery_Order, Remarks, fever, sore_throat, dry_cough, runny_nose, shortness_of_breath, body_ache, travelled_oversea_last_14_days, contact_with_person_with_Covid_19, recovered_from_covid_19, covid_19_test) {
    try {
        await client.connect();

        const existingVisitor = await client.db("VMS").collection("Visitors").findOne({ identification_No });

        if (existingVisitor) {
            console.log("User is already registered!");
            return;
        }

        const hostContact = await client.db("VMS").collection("UserInfo").findOne({ identification_No: host });
        if (!hostContact) {
            console.log("Host not found!");
            return;
        }

        const hostNumber = hostContact.phone_number;

        await client.db("VMS").collection("Visitors").insertOne({
            identification_No,
            name,
            gender,
            ethnicity,
            temperature,
            dateofbirth,
            citizenship,
            document_type,
            expiryDate,
            address,
            town,
            postcode,
            state,
            country,
            phone_number,
            vehicle_number,
            vehicle_type,
            visitor_category,
            preregistered_pass,
            no_of_visitors,
            date,
            time,
            purpose_of_visit,
            visit_limit_hrs,
            visit_limit_min,
            To_meet,
            Host_Information,
            Location_or_department,
            Unit_no,
            Location_Information,
            Permit_number,
            Delivery_Order,
            Remarks,
            hostContact: hostNumber
        });

        await client.db("VMS").collection("Health Status").insertOne({
            identification_No,
            Name: name,
            temperature,
            fever,
            sore_throat,
            dry_cough,
            runny_nose,
            shortness_of_breath,
            body_ache,
            travelled_oversea_last_14_days,
            contact_with_person_with_Covid_19,
            recovered_from_covid_19,
            covid_19_test,
            date,
            hostContact: hostNumber
        });

        console.log("Registered successfully!");
    } catch (error) {
        console.error("An error occurred:", error.message);
        throw error; // Propagate the error for better handling at the calling site
    } finally {
        await client.close();
    }
}



//update Visitor for admin
async function updateVisitor(host, identification_No, name, gender, ethnicity, temperature, dateofbirth, citizenship, document_type, expiryDate, address, town, postcode, state, country, phone_number, vehicle_number, vehicle_type, visitor_category, preregistered_pass, no_of_visitors, purpose_of_visit, visit_limit_hrs, visit_limit_min, To_meet, Host_Information, Location_or_department, Unit_no, Location_Information, Permit_number, Delivery_Order, Remarks, fever, sore_throat, dry_cough, runny_nose, shortness_of_breath, body_ache, travelled_oversea_last_14_days, contact_with_person_with_Covid_19, recovered_from_covid_19, covid_19_test, date) {
    try {
      // Connect to the MongoDB server
      await client.connect();
      console.log('Connected to the MongoDB server');
      const host_number = await client.db("VMS").collection("UserInfo").findOne(host);
      const exist = await client.db("VMS").collection("Visitors").findOne({ identification_No: identification_No });
      if (exist) {
        await client.db("VMS").collection("Visitors").updateOne(
            { identification_No: identification_No },
            {$set: {
                name: name,
                gender: gender,
                ethnicity: ethnicity,
                temperature: temperature,
                dateofbirth: dateofbirth,
                citizenship: citizenship,
                document_type: document_type,
                expiryDate: expiryDate,
                address: address,
                town: town,
                postcode: postcode,
                state: state,
                country: country,
                phone_number: phone_number,
                vehicle_number: vehicle_number,
                vehicle_type: vehicle_type,
                visitor_category: visitor_category,
                preregistered_pass: preregistered_pass,
                no_of_visitors: no_of_visitors,
                purpose_of_visit: purpose_of_visit,
                visit_limit_hrs: visit_limit_hrs,
                visit_limit_min: visit_limit_min,
                To_meet: To_meet,
                Host_Information: Host_Information,
                Location_or_department: Location_or_department,
                Unit_no: Unit_no,
                Location_Information: Location_Information,
                Permit_number: Permit_number,
                Delivery_Order: Delivery_Order,
                Remarks: Remarks,
                hostContact: host_number.phone_number
              }
            }
          );
      await client.db("VMS").collection("Health Status").updateOne(
        { identification_No: identification_No },
        {
          $set: {
            Name: name,
            temperature: temperature,
            fever: fever,
            sore_throat: sore_throat,
            dry_cough: dry_cough,
            runny_nose: runny_nose,
            shortness_of_breath: shortness_of_breath,
            body_ache: body_ache,
            travelled_oversea_last_14_days: travelled_oversea_last_14_days,
            contact_with_person_with_Covid_19: contact_with_person_with_Covid_19,
            recovered_from_covid_19: recovered_from_covid_19,
            covid_19_test: covid_19_test,
            date: date,
            hostContact: host_number.phone_number
          }
        }
      );
      console.log("Updated successfully!");
    }else {
        console.log("Visitor not found!");
      }
    } catch (error) {
      console.error("Error updating visitor:", error);
    } finally {
      // Close the connection
      await client.close();
      console.log('Connection closed');
    }
  }

  async function createSecurityPersonnel(res, identification_No, name, password) {
    try {
        // Password policy checks
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Check for at least one capital letter
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one capital letter' });
        }

        // Check for at least one unique character (e.g., special character)
        if (!/[^a-zA-Z0-9]/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one special character' });
        }

        // Check for at least one number
        if (!/\d/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one number' });
        }

        await client.connect();
        const exist = await client.db("VMS").collection("UserInfo").findOne({ identification_No });

        if (exist) {
            return res.status(400).json({ error: "Identification number already exists" });
        }

        const newSecurityPersonnel = {
            identification_No,
            name,
            password,
            role: "Security"
        };

        const result = await client.db("VMS").collection("UserInfo").insertOne(newSecurityPersonnel);
        if (result) {
            res.status(200).json({ message: "Security personnel registered successfully" });
        } else {
            res.status(500).json({ error: "Registration failed" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
}


//Logs function
async function logs(identification_No, name, role) {
    const options = { timeZone: 'Asia/Kuala_Lumpur' }; // Set the time zone to Malaysia

    // Get the current date and time in Malaysia
    const currentDate = new Date().toLocaleDateString('en-MY', options);
    const currentTime = new Date().toLocaleTimeString('en-MY', options);

    await client.connect();

    // Insert the log with the formatted local date and time
    client.db("VMS").collection("Logs").insertOne({
        identification_No: identification_No,
        name: name,
        Type: role,
        date: currentDate,
        entry_time: currentTime,
        exit_time: "pending"
    });
}

    
//login for staff
async function login(res, identification, password) {
    try {
        await client.connect();
        const exist = await client.db("VMS").collection("UserInfo").findOne({ identification_No: identification });
        if (exist) {
            const passwordMatch = await bcrypt.compare(password, exist.password);
            if (passwordMatch) {
                logs(identification, exist.name, exist.role);
                const token = jwt.sign({ identification_No: identification, role: exist.role }, privatekey);

                // Check if the role is admin and dump all staff data
                if (exist.role === 'Admin') {
                    const allStaffData = await client.db("VMS").collection("UserInfo").find({}).toArray();
                    res.send({
                        Token: token,
                        "All Staff Data": allStaffData
                    });
                } else {
                    res.send("Token: " + token);
                }
            } else {
                res.status(401).send("Wrong password!");
            }
        } else {
            res.status(404).send("Username not exist!");
        }
    } catch (error) {
        res.status(500).send("Error occurred: " + error.message);
    }
}


async function visitorLogin(res, identification_No) {
    try {
        await client.connect();
        const visitor = await client.db("VMS").collection("Visitors").findOne({ identification_No });

        if (visitor) {
            const host = await client.db("VMS").collection("UserInfo").findOne({ phone_number: visitor.hostContact });
            const date = await client.db("VMS").collection("Health Status").findOne({identification_No})

            if (host) {
                res.json({
                    message: "Welcome!",
                    "Host Identification No": host.identification_No,
                    "Time Of Visit": date.date,
                    "Date of Visit" : date.time
                });

            } else {
                res.status(404).json({ error: "Host not found" });
            }
        } else {
            res.status(404).json({ error: "Visitor not registered" });
        }
    } catch (error) {
        console.error("An error occurred:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}



//view visitor
async function viewVisitors(identification_No, role) {
    try {
        await client.connect();
        let result;

        if (role === "Admin" || role === "Security") {
            // Admin and Security can view all visitors
            result = await client.db("VMS").collection("Visitors").find({}).toArray();
        } else if (role === "Staff") {
            // Staff can view only their registered visitors

            // Retrieve staff information based on identification number
            const staffInfo = await client.db("VMS").collection("UserInfo").findOne({ identification_No: identification_No });

            if (staffInfo) {
                // If staff information is found, get the staff's phone number
                const hostNumber = staffInfo.phone_number;

                // Retrieve visitors registered by the staff
                result = await client.db("VMS").collection("Visitors").find({ hostContact: hostNumber }).toArray();

                if (result.length === 0) {
                    // Handle the case where staff has no registered visitors
                    result = { message: 'You have no registered visitors' };
                }
            } else {
                // Handle the case where staff information is not found
                result = { error: 'Staff not found' };
            }
        } else {
            // Handle other roles or unauthorized access
            result = { error: 'Unauthorized access' };
        }

        return result;
    } catch (error) {
        // Handle errors appropriately
        console.error("An error occurred:", error.message);
        return { error: 'Internal server error' }; // Return an appropriate error response
    }
}


//post method to register visitor
/**
 * @swagger
 * /user/registerVisitor:
 *   post:
 *     summary: Register a visitor
 *     description: Register a visitor with required details
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identification_No:
 *                 type: string
 *               name:
 *                 type: string
 *               gender:
 *                 type: string
 *               ethnicity:
 *                 type: string
 *               temperature:
 *                 type: string
 *               dateofbirth:
 *                 type: string
 *               citizenship:
 *                 type: string
 *               document_type:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *               town:
 *                 type: string
 *               postcode:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               vehicle_number:
 *                 type: string
 *               vehicle_type:
 *                 type: string
 *               visitor_category:
 *                 type: string
 *               preregistered_pass:
 *                 type: string
 *               no_of_visitors:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *               purpose_of_visit:
 *                 type: string
 *               visit_limit_hrs:
 *                 type: string
 *               visit_limit_min:
 *                 type: string
 *               To_meet:
 *                 type: string
 *               Host_Information:
 *                 type: string
 *               Location_or_department:
 *                 type: string
 *               Unit_no:
 *                 type: string
 *               Location_Information:
 *                 type: string
 *               Permit_number:
 *                 type: string
 *               Delivery_Order:
 *                 type: string
 *               Remarks:
 *                 type: string
 *               fever:
 *                 type: string
 *               sore_throat:
 *                 type: string
 *               dry_cough:
 *                 type: string
 *               runny_nose:
 *                 type: string
 *               shortness_of_breath:
 *                 type: string
 *               body_ache:
 *                 type: string
 *               travelled_oversea_last_14_days:
 *                 type: string
 *               contact_with_person_with_Covid_19:
 *                 type: string
 *               recovered_from_covid_19:
 *                 type: string
 *               covid_19_test:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Visitor registration successful
 *       '400':
 *         description: Invalid request body or insufficient permissions
 *       '401':
 *         description: Unauthorized - Invalid token or insufficient permissions
 *       '500':
 *         description: Unauthorized - Error during token validation/ No token given.
 *     consumes:
 *       - "application/json"
 *     produces:
 *       - "application/json"
 */

app.post('/user/registerVisitor', async function(req, res){

    try {
        let decoded;

        const token = req.header('Authorization').split(" ")[1];

        decoded = jwt.verify(token, privatekey);
        if (!decoded || !decoded.role) {
            res.status(401).send("Unauthorized: Invalid or missing token");
            return;
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error during token verification");
        return;
    }

    if (decoded.role === "Staff" || decoded.role === "Admin") {
        const {
            identification_No, name, gender, ethnicity, temperature, dateofbirth, citizenship, document_type, expiryDate, address, town, postcode, state, country, phone_number, vehicle_number, vehicle_type, visitor_category, preregistered_pass, no_of_visitors, date, time, purpose_of_visit, visit_limit_hrs, visit_limit_min, To_meet, Host_Information, Location_or_department, Unit_no, Location_Information, Permit_number, Delivery_Order, Remarks, fever, sore_throat, dry_cough, runny_nose, shortness_of_breath, body_ache, travelled_oversea_last_14_days, contact_with_person_with_Covid_19, recovered_from_covid_19, covid_19_test
        } = req.body;

        try {
            const host = decoded.identification_No;

            // Assuming register is an asynchronous function that may throw errors
            await register(host, identification_No, name, gender, ethnicity, temperature, dateofbirth, citizenship, document_type, expiryDate, address, town, postcode, state, country, phone_number, vehicle_number, vehicle_type, visitor_category, preregistered_pass, no_of_visitors, date, time, purpose_of_visit, visit_limit_hrs, visit_limit_min, To_meet, Host_Information, Location_or_department, Unit_no, Location_Information, Permit_number, Delivery_Order, Remarks, fever, sore_throat, dry_cough, runny_nose, shortness_of_breath, body_ache, travelled_oversea_last_14_days, contact_with_person_with_Covid_19, recovered_from_covid_19, covid_19_test);

            res.send("Registered visitor successfully!");
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while registering the visitor");
        }
    } else {
        res.status(403).send("Forbidden: You do not have access");
    }
});



/**
 * @swagger
 * /security/register:
 *   post:
 *     summary: Register a security personnel
 *     description: Register a new security personnel with identification number, name, password, and role.
 *     tags:
 *       - Security
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identification_No:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Security personnel registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       '400':
 *         description: Identification number already exists or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for existing identification number or bad request
 *       '500':
 *         description: Registration failed or internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for registration failure or internal server error
 */

app.post('/security/register', async function(req, res){
    const { identification_No, name, password } = req.body;
    const hashedPassword = await generateHash(password);

    await createSecurityPersonnel(res,identification_No, name, hashedPassword);
});

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new staff member
 *     description: Register a new staff member with identification number, name, password, and phone number.
 *     tags:
 *       - Security
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identification_No:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Staff registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       '400':
 *         description: Staff already exists or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for existing staff or bad request
 *       '403':
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Unauthorized access error message
 *       '500':
 *         description: Failed to register staff or unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for registration failure or unauthorized access
 */

app.post('/user/register', async function(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const { identification_No, name, password, phone_number } = req.body;
        const hashedPassword = await generateHash(password);
        
        // Verify the JWT token
        const decodedToken = jwt.verify(token, privatekey);
        
        // Check if the role in the token is "Security"
        if (decodedToken.role !== 'Security') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }
        
        // Check if the staff already exists in your database
        await client.connect();
        const existingStaff = await client.db("VMS").collection("UserInfo").findOne({ identification_No });
        
        if (existingStaff) {
            return res.status(400).json({ error: 'Staff already exists' });
        }

        // Password policy checks
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Check for at least one capital letter
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one capital letter' });
        }

        // Check for at least one unique character (e.g., special character)
        if (!/[^a-zA-Z0-9]/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one special character' });
        }

        // Check for at least one number
        if (!/\d/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one number' });
        }

        // Logic to register the new staff
        await registerStaff(identification_No, name, hashedPassword, phone_number);
        
        // Send success response upon successful registration
        return res.status(200).json({ message: 'Staff registered successfully' });
    } catch (error) {
        // Send error response if registration fails or token validation fails
        console.error(error);
        return res.status(500).json({ error: 'Failed to register staff or unauthorized access' });
    }
});



//register user without authentication
/**
 * @swagger
 * /user/registerNoAuth:
 *   post:
 *     summary: Register a new staff member without security approval
 *     description: Register a new staff member with identification number, name, password, and phone number.
 *     tags:
 *       - Security
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identification_No:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Staff registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       '400':
 *         description: Staff already exists or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for existing staff or bad request
 *       '403':
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Unauthorized access error message
 *       '500':
 *         description: Failed to register staff or unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for registration failure or unauthorized access
 */

app.post('/user/registerNoAuth', async function(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const { identification_No, name, password, phone_number } = req.body;
        const hashedPassword = await generateHash(password);
        
        // Verify the JWT token
        const decodedToken = jwt.verify(token, privatekey);
        
        // Check if the role in the token is "Security"
        if (decodedToken.role !== 'Security') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }
        
        // Check if the staff already exists in your database
        await client.connect();
        const existingStaff = await client.db("VMS").collection("UserInfo").findOne({ identification_No });
        
        if (existingStaff) {
            return res.status(400).json({ error: 'Staff already exists' });
        }

        // Password policy checks
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Check for at least one capital letter
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one capital letter' });
        }

        // Check for at least one unique character (e.g., special character)
        if (!/[^a-zA-Z0-9]/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one special character' });
        }

        // Check for at least one number
        if (!/\d/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one number' });
        }

        // Logic to register the new staff
        await registerStaff(identification_No, name, hashedPassword, phone_number);
        
        // Send success response upon successful registration
        return res.status(200).json({ message: 'Staff registered successfully' });
    } catch (error) {
        // Send error response if registration fails or token validation fails
        console.error(error);
        return res.status(500).json({ error: 'Failed to register staff or unauthorized access' });
    }
});


//login post for staff
/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Authenticate user
 *     description: Login with identification number and password
 *     tags:
 *       - Staff
 *       - Security
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identification_No:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Unauthorized - Invalid credentials
 */
app.post('/user/login',loginLimiter, async function(req, res){
    const { identification_No, password } = req.body;
    await login(res, identification_No, password);
});


//user logout
/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user by updating exit time in logs
 *     tags:
 *       - Staff
 *       - Security
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User successfully logged out
 *       '400':
 *         description: Invalid request or user not logged in before
 */
const blacklistedTokens = [];

app.post('/user/logout', async function(req, res){
    try {
        const token = req.header('Authorization').split(' ')[1];

        // Check if the token is blacklisted
        if (blacklistedTokens.includes(token)) {
            return res.status(401).json({ message: 'User already logged out. Please reauthenticate.' });
        }

        const decodedToken = jwt.verify(token, privatekey);

        const currentDate = new Date();
        const exitTime = currentDate.toLocaleTimeString("en-US", { timeZone: "Asia/Kuala_Lumpur" }); // Get the time only

        await client.connect();
        const exist = await client.db("VMS").collection("UserInfo").findOne({ identification_No: decodedToken.identification_No });
        if (exist) {
            // Update logs with exit time
            await client.db("VMS").collection("Logs").updateOne(
                { identification_No: decodedToken.identification_No },
                { $set: { exit_time: exitTime, date: currentDate.toLocaleDateString() } }
            );

            // Add the token to the blacklist
            blacklistedTokens.push(token);

            res.send(`Successfully logged out!\nCheck out time: ${exitTime}`);
        } else {
            res.send("User not found!");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
});



//delete visitors
/**
 * @swagger
 * /deleteVisitors/{id}:
 *   delete:
 *     summary: Delete visitor by ID
 *     description: Delete a visitor and their health status by ID
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the visitor to be deleted
 *     requestBody:
 *       required: false
 *     responses:
 *       '200':
 *         description: Visitor deleted successfully
 *       '400':
 *         description: Visitor not found or insufficient permissions
 *       '401':
 *         description: Unauthorized - Invalid token or insufficient permissions
 *     consumes:
 *       - "application/json"
 *     produces:
 *       - "application/json"
 *   securityDefinitions:
 *     JWT:
 *       type: "apiKey"
 *       name: "Authorization"
 *       in: "header"
 */
app.delete('/deleteVisitors/:id',async function(req, res) {
    const documentId = req.params.id;
    var token = req.header('Authorization').split(" ")[1];
    var decoded = jwt.verify(token, privatekey);
    console.log(decoded.role);
    await client.connect();
if(decoded.role == "Admin"|| decoded.role == "Staff"){
    const exist = await client.db("VMS").collection("Visitors").findOne({identification_No: documentId})
    if(exist){
        await client.db("VMS").collection("Visitors").deleteOne({ identification_No: documentId });
        await client.db("VMS").collection("Health Status").deleteOne({ identification_No: documentId });
        res.send("Deleted Successfully!");
    }else{
        res.send("Visitor not found!");
    }}
    else{
        res.send("No access!");
    }
});



//login post for visitor
/**
 * @swagger
 * /visitor/retrievePass:
 *   post:
 *     summary: Visitor retrieval pass
 *     description: Visitor to retrieve pass by using visitor's ID
 *     tags:
 *       - Visitors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identification_No:
 *                 type: string 
 *                 description: Identification number of the visitor
 *     responses:
 *       '200':
 *         description: Visitor login successful
 *       '401':
 *         description: Invalid credentials or visitor not found
 */

app.post('/visitor/retrievePass', async function(req, res){
    const {identification_No} = req.body;
    await visitorLogin(res, identification_No);
});

//View Visitor
/**
 * @swagger
 * /user/view/visitor:
 *   post:
 *     summary: "View visitors"
 *     description: "Retrieve visitors based on user role"
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Visitors retrieved successfully"
 *       '400':
 *         description: "Invalid token or error in retrieving visitors"
 *       '401':
 *         description: "Unauthorized - Invalid token or insufficient permissions"
 *     consumes:
 *       - "application/json"
 *     produces:
 *       - "application/json"
 */
app.post('/user/view/visitor', async function(req, res){
    try {
        var token = req.header('Authorization').split(" ")[1];
        var decoded = jwt.verify(token, privatekey);
        console.log(decoded.role);
        res.send(await viewVisitors(decoded.identification_No, decoded.role));
      } catch(err) {
        res.send("Error!");
      }
});

//update visitor
/**
 * @swagger
 * /user/updateVisitor:
 *   post:
 *     summary: Update visitor information
 *     description: Update visitor details based on user role
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identification_No:
 *                 type: string
 *               name:
 *                 type: string
 *               gender:
 *                 type: string
 *               ethnicity:
 *                 type: string
 *               temperature:
 *                 type: string
 *               dateofbirth:
 *                 type: string
 *                 format: date
 *               citizenship:
 *                 type: string
 *               document_type:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *               town:
 *                 type: string
 *               postcode:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               vehicle_number:
 *                 type: string
 *               vehicle_type:
 *                 type: string
 *               visitor_category:
 *                 type: string
 *               preregistered_pass:
 *                 type: string
 *               no_of_visitors:
 *                 type: integer
 *               purpose_of_visit:
 *                 type: string
 *               visit_limit_hrs:
 *                 type: integer
 *               visit_limit_min:
 *                 type: integer
 *               To_meet:
 *                 type: string
 *               Host_Information:
 *                 type: string
 *               Location_or_department:
 *                 type: string
 *               Unit_no:
 *                 type: string
 *               Location_Information:
 *                 type: string
 *               Permit_number:
 *                 type: string
 *               Delivery_Order:
 *                 type: string
 *               Remarks:
 *                 type: string
 *               fever:
 *                 type: boolean
 *               sore_throat:
 *                 type: boolean
 *               dry_cough:
 *                 type: boolean
 *               runny_nose:
 *                 type: boolean
 *               shortness_of_breath:
 *                 type: boolean
 *               body_ache:
 *                 type: boolean
 *               travelled_oversea_last_14_days:
 *                 type: boolean
 *               contact_with_person_with_Covid_19:
 *                 type: boolean
 *               recovered_from_covid_19:
 *                 type: boolean
 *               covid_19_test:
 *                 type: boolean
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       '200':
 *         description: Visitor information updated successfully
 *       '400':
 *         description: Invalid request body or insufficient permissions
 *       '401':
 *         description: Unauthorized - Invalid token or insufficient permissions
 *     consumes:
 *       - "application/json"
 *     produces:
 *       - "application/json"
 */


app.post('/user/updateVisitor', async function(req, res){
    var token = req.header('Authorization').split(" ")[1];
    const {identification_No, name, gender, ethnicity, temperature, dateofbirth, citizenship, document_type, expiryDate, address, town, postcode, state, country, phone_number, vehicle_number, vehicle_type, visitor_category, preregistered_pass, no_of_visitors, purpose_of_visit, visit_limit_hrs, visit_limit_min, To_meet, Host_Information, Location_or_department, Unit_no, Location_Information, Permit_number, Delivery_Order, Remarks, fever, sore_throat, dry_cough, runny_nose, shortness_of_breath, body_ache, travelled_oversea_last_14_days, contact_with_person_with_Covid_19, recovered_from_covid_19, covid_19_test, date} = req.body;
    var decoded = jwt.verify(token, privatekey);
    console.log(decoded.role);
    if(decoded.role == "Admin" || decoded.role == "Staff"){
        await updateVisitor(identification_No, name, gender, ethnicity, temperature, dateofbirth, citizenship, document_type, expiryDate, address, town, postcode, state, country, phone_number, vehicle_number, vehicle_type, visitor_category, preregistered_pass, no_of_visitors, purpose_of_visit, visit_limit_hrs, visit_limit_min, To_meet, Host_Information, Location_or_department, Unit_no, Location_Information, Permit_number, Delivery_Order, Remarks, fever, sore_throat, dry_cough, runny_nose, shortness_of_breath, body_ache, travelled_oversea_last_14_days, contact_with_person_with_Covid_19, recovered_from_covid_19, covid_19_test, date);
    }else{
        res.send("No access!");
    }
});


//To view logs for authorized user
/**
 * @swagger
 * /user/view/Logs:
 *   post:
 *     summary: "View all logs in the database"
 *     description: "Retrieve logs for all users in database"
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Logs retrieved successfully"
 *       '400':
 *         description: "Invalid token or error in retrieving logs"
 *       '401':
 *         description: "Unauthorized - Invalid token or insufficient permissions"
 *     consumes:
 *       - "application/json"
 *     produces:
 *       - "application/json"
 * securityDefinitions:
 *   JWT:
 *     type: "apiKey"
 *     name: "Authorization"
 *     in: "header"
 */
app.post('/user/view/Logs', async function(req, res){
    var token = req.header('Authorization').split(" ")[1];
    await client.connect()
    var decoded = jwt.verify(token, privatekey);
    console.log(decoded.role);
    if(decoded.role == "Admin" || decoded.role == "Security"){
        const datalogs = await client.db("VMS").collection("Logs").find({}).toArray() 
        res.send(datalogs);
    }else{
        res.send("No access!");
    }
})


// return pass for visitor
/**
 * @swagger
 * /visitor/returnPass:
 *   post:
 *     summary: Track exit time of visitors
 *     description: Update logs for every visitor
 *     tags:
 *       - Visitors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identification_No:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Visitor logged out successfully
 *       '400': 
 *         description: Invalid request body or user not logged in
 */

app.post('/visitor/returnPass', async function(req, res){
    const {identification_No} = req.body;
    const currentDate = new Date();
    const formattedTime = currentDate.toLocaleTimeString(); // Format: HH:MM:SS
    await client.connect();
    const exist = await client.db("VMS").collection("Visitors").findOne({identification_No: identification_No});
    if(exist){
        await client.db("VMS").collection("Logs").updateOne({identification_No: identification_No},{$set:{exit_time: formattedTime}});
        res.send("Successfully log Out!\nCheck out time: "+ formattedTime);
    }else{
        res.send("User not logged In!");
    }
});

/**
 * @swagger
 * /Admin/register:
 *   post:
 *     summary: Register a new admin
 *     description: Register a new admin with identification number, name, password, and phone number.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identification_No:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Admin registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       '400':
 *         description: Admin already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for existing admin
 *       '500':
 *         description: Failed to register admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for registration failure
 */
app.post('/Admin/register', async function(req, res) {
    const { identification_No, name, password, phone_number } = req.body;
    const hashedPassword = await generateHash(password); // Encrypting the password
    try {
        await client.connect();
        const existingAdmin = await client.db("VMS").collection("UserInfo").findOne({ identification_No });

        // Password policy checks
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Check for at least one capital letter
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one capital letter' });
        }

        // Check for at least one unique character (e.g., special character)
        if (!/[^a-zA-Z0-9]/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one special character' });
        }

        // Check for at least one number
        if (!/\d/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one number' });
        }

        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        await registerAdmin(identification_No, name, hashedPassword, phone_number);
        res.status(200).json({ message: 'Admin registered successfully' });
    } catch (error) {
        // Send error response if registration fails
        res.status(500).json({ error: 'Failed to register admin' });
    }
});
//Additional API
/**
* @swagger
* /Admin/manage-roles/{userId}:
*   put:
*     summary: Update user role by authenticated administrator
*     description: Update user role based on the provided user ID for an authenticated administrator
*     tags:
*       - Admin
*     security:
*       - bearerAuth: []  # Assuming you're using bearer token authentication
*     parameters:
*       - in: path
*         name: userId
*         description: ID of the user to update role
*         required: true
*         schema:
*           type: string
*       - in: body
*         name: userRole
*         description: User role information for update
*         required: true
*         schema:
*           type: object
*           properties:
*             role:
*               type: string
*               description: New role to be assigned to the user
*     responses:
*       '200':
*         description: Account role updated successfully
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   description: Success message
*                 updatedUser:
*                   type: object
*                   description: Updated user information (excluding sensitive fields)
*       '401':  # Unauthorized (more specific than 403)
*         description: Unauthorized access
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   description: Error message for unauthorized access
*       '403':  # Forbidden (if applicable)
*         description: Forbidden access
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   description: Error message for forbidden access
*       '404':
*         description: User not found
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   description: Error message for user not found
*       '500':
*         description: Failed to update account role
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   description: Error message for failed update
*     consumes:
*       - application/json
*     produces:
*       - application/json
*/

app.put('/Admin/manage-roles/:userId', async function(req, res) {
    let client;

    try {
        client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        const { userId } = req.params;
        const { role } = req.body;
        const token = req.headers.authorization.split(' ')[1];

        const decodedToken = jwt.verify(token, privatekey);

        if (decodedToken.role !== 'Admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const userToUpdate = await client.db("VMS").collection("UserInfo").findOne({ identification_No: userId });

        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = await client.db("VMS").collection("UserInfo").updateOne(
            { identification_No: userId },
            { $set: { role: role } }
        );

        if (updatedUser.matchedCount > 0) {
            const updatedUserData = await client.db("VMS").collection("UserInfo").findOne({ identification_No: userId });
            return res.status(200).json({
                message: 'Account role updated successfully',
                updatedUser: updatedUserData // Include updated user's data in the response
            });
        } else {
            return res.status(500).json({ error: 'Failed to update user role' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to update account role or unauthorized access' });
    } finally {
        if (client) {
            await client.close();
        }
    }
});


// Endpoint for authenticated security to retrieve host contact number from visitor pass
/**
 * @swagger
 * /security/visitor-pass/{identification_No}/host-contact:
 *   get:
 *     summary: Retrieve host contact number from visitor pass (authenticated security)
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: identification_No
 *         description: Identification number from the visitor pass
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: Host contact number retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             hostContact:
 *               type: string
 *               description: Contact number of the host
 *       '403':
 *         description: Unauthorized access
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message for unauthorized access
 *       '404':
 *         description: Visitor pass not found or host contact unavailable
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message for pass not found or host contact unavailable
 *       '500':
 *         description: Failed to retrieve host contact or unauthorized access
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message for failed retrieval or unauthorized access
 *     tags:
 *       - Security
 *     security:
 *       - bearerAuth: []
 */

app.get('/security/visitor-pass/:identification_No/host-contact', async function(req, res) {
    const { identification_No } = req.params;
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decodedToken = jwt.verify(token, privatekey);

        if (decodedToken.role !== 'Security') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        // Logic to retrieve host's contact number from the visitor pass
        await client.connect();
        const visitorPass = await client.db("VMS").collection("Visitors").findOne({ identification_No });

        if (visitorPass && visitorPass.hostContact) {
            res.status(200).json({ hostContact: visitorPass.hostContact });
        } else {
            res.status(404).json({ error: 'Visitor pass not found or host contact unavailable' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve host contact or unauthorized access' });
    }
});





app.get('/', (req, res)=>{
    res.send("Testing deployment from zikryy.azurewebsites.net");
});



app.listen(port, () => {
    console.log(`Server listening at port ${port}`)
  });
