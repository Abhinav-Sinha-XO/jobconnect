CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM users;

DELETE FROM users
WHERE email = 'riyassss@gmail.com';

ALTER TABLE users
ADD COLUMN reset_password_token VARCHAR(255),
ADD COLUMN reset_password_expires TIMESTAMP;



SELECT
    email,
    reset_password_token,
    reset_password_expires
FROM users;


CREATE TABLE companies (
    id SERIAL PRIMARY KEY,

    owner_id INTEGER NOT NULL UNIQUE,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    website VARCHAR(255),

    location VARCHAR(150) NOT NULL,

    logo VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_company_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

SELECT * FROM companies;

DROP TABLE companies;



-- Table - Jobs


CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    location VARCHAR(150) NOT NULL,
    salary INTEGER NOT NULL,
    experience INTEGER NOT NULL,
    job_type VARCHAR(30) NOT NULL,
    vacancies INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
);


SELECT * FROM jobs;

INSERT INTO jobs
(
    company_id,
    title,
    description,
    requirements,
    location,
    salary,
    experience,
    job_type,
    vacancies,
    status
)
VALUES
(
    2,
    'Frontend Developer',
    'Build responsive web applications using React.',
    'React, JavaScript, HTML, CSS',
    'Bangalore',
    1200000,
    2,
    'Full-time',
    3,
    'Open'
);




CREATE TABLE applications (

    id SERIAL PRIMARY KEY,

    candidate_id INTEGER NOT NULL,

    job_id INTEGER NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'Pending',

    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_job
        FOREIGN KEY (job_id)
        REFERENCES jobs(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_candidate_job
        UNIQUE(candidate_id, job_id)

);



SELECT *
FROM applications;
