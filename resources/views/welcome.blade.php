<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EntDev - Databases</title>
    <link rel="stylesheet" href="/css/bootstrap.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&display=swap" rel="stylesheet">

    <style>
        body {
            background-color: 'black';
            font-family: 'IBM Plex Mono', monospace;
        }

        h1 {
            color: #cad2c5;
        }

        .card {
            border: 0px solid #cad2c5;
            /* add shadow to the card */
            -webkit-box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.25);
        }

        .card-header {
            background-color: #354f52;
            color: #cad2c5;
        }

        .card-body {
            background-color: #354f52;
            color: #cad2c5;
        }

        .table {
            background-color: #cad2c5;
            color: #2f3e46;
        }
    </style>
</head>

<body>
    <div class="container mt-5 mb-5 h-100">
        <div class="row">
            <div class="col col-10">
                <h1>Ent<strong>Dev</strong>_DBs<span id="cursor">|</span></h1>
            </div>
            <div class="col col-2">
                <button class="btn" onclick="toggle_theme()" id="theme_button">🌙</button>
            </div>
        </div>

        @if(isset($funny_message))
        <div class="row">
            <div class="col col-12">
                <div class="alert alert-danger" role="alert">
                    {{ $funny_message }}
                </div>
            </div>
        </div>
        @endif


        <div class="row">
            <!-- 2 columns left: server data like ip, username, password, and right lists of databases available -->
            <div class="col col-6">
                <div class="card">
                    <div class="card-header">
                        <h2>🖥️ Server data</h2>
                    </div>
                    @if($pass_string == "")
                    <div class="card-body">
                        <h3>🔐 Enter password</h3>
                        <form action="/" method="GET">
                            <input type="text" name="pass" placeholder="password">
                            <input type="submit" value="Submit">
                        </form>
                    </div>
                    @elseif($pass_match)
                    <div class="card-body">
                        <table class="table">
                            <tr>
                                <th>IP</th>
                                <td>{{ env('DB_IP') }}</td>
                            </tr>
                            <tr>
                                <th>Username</th>
                                <td>{{ env('DB_USERNAME') }}</td>
                            </tr>
                            <tr>
                                <th>Password</th>
                                <td>{{ env('DB_PASSWORD') }}</td>
                            </tr>
                        </table>
                    </div>
                    @else
                    <div class="card-body">
                        <h3 class="text text-error">🔐 Wrong password</h3>
                        Maybe you want to try again?
                        <form action="/" method="GET">
                            <input type="text" name="pass" placeholder="password">
                            <input type="submit" value="Submit">
                        </form>
                    </div>
                    @endif
                </div>
            </div>
            <div class="col col-6">
                <div class="card">
                    <div class="card-header">
                        <h2>💾 DBs</h2>
                    </div>
                    <div class="card-body">
                        <!-- list databases in a table with delete action if pass_match -->
                        <table class="table">
                            <tr>
                                <th>Database</th>
                                @if($pass_match)
                                <th>Delete</th>
                                @endif
                            </tr>
                            @foreach($databases as $database)
                            <tr>
                                <td>{{ $database }}</td>
                                @if($pass_match)
                                <td>
                                    <form action="/" method="POST">
                                        <input type="hidden" name="_method" value="DELETE">
                                        <input type="hidden" name="db_name" value="{{ $database }}">
                                        <input type="hidden" name="pass" value="{{ $pass_string }}">
                                        <input type="submit" value="Delete">
                                    </form>
                                </td>
                                @endif
                            </tr>
                            @endforeach
                        </table>
                        @if($pass_match)
                        <form action="/" method="POST">
                            <input type="text" name="db_name" placeholder="database name">
                            <input type="hidden" name="pass" value="{{ $pass_string }}">
                            <input type="submit" value="Create">
                        </form>
                        @endif
                    </div>
                </div>
            </div>
        </div>
</body>
<script>
    // cursor animation
    const cursor = document.getElementById('cursor');
    setInterval(() => {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
    }, 500);

    // toggle theme, if body has class dark, remove it, else add it
    const toggle_theme = () => {
        const body = document.querySelector('body');
        const theme_button = document.getElementById('theme_button');
        // if body background color is black, change it to white, else change it to black
        if (body.style.backgroundColor === 'black') {
            body.style.backgroundColor = 'white';
            theme_button.innerText = '🌙';
        } else {
            body.style.backgroundColor = 'black';
            theme_button.innerText = '☀️';
        }
    }

    // toggle theme on alt + t
    document.addEventListener('keydown', (event) => {
        if (event.altKey && event.key === 't') {
            toggle_theme();
        }
    });
    
</script>
</html>