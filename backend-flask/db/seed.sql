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
        'nwaliechinyerejessica@gmail.com',
        'nwaliechinyere',
        'MOCK'
    ), (
        'chiechee nwalie',
        'nwaliechinyere+1@gmail.com',
        'cloudgeekchie',
        'MOCK'
    ), (
        'Andrew Bayko',
        'bayko@exampro.com',
        'bayko',
        'MOCK'
    ), (
        'Londo Mollari',
        'lmollari@centari.com',
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
    ),
    
        ( (
            SELECT uuid 
            from public.users 
            WHERE 
                users.handle = 'cloudgeekchie' 
            LIMIT 
                1
        ), 'I am the other!', current_timestamp + interval '10 day'
    );