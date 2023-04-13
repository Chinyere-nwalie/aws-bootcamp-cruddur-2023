-- this file was manually created

INSERT INTO
    public.users (
        display_name,
        email,
        handle,
        cognito_user_id
    )
VALUES (
        'nwalie chinyere',
        'nwaliechinyerejessica+andrewbrown@gmail.com',
        'nwaliechinyere',
        'MOCK'
    ), (
        'Andrew Bayko',
        'nwaliechinyerejessica+bayko@gmail.com',
        'bayko',
        'MOCK'
    ), (
        'Londo Mollari',
        'nwaliechinyerejessica+lmollari@gmail.com',
        'londo',
        'MOCK'
    );

INSERT INTO
    public.activities (user_uuid, message, expires_at)
VALUES ( (
            SELECT uuid
            from public.users
            WHERE
                users.handle = 'nwaliechinyere'
            LIMIT
                1
        ), 'This was imported as seed data!', current_timestamp + interval '10 day'
    )
