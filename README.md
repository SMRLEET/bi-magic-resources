# Редактор ресурсов Luxms BI

## Описание
Проект создан для упрощения работы с ресурсами Luxms BI и для организации их хранения в репозитории.

Для каждого проекта создается своя ветка, которая будет хранить все ресурсные файлы, их историю и
скрипты для синхронизации

## Сценарий использования
Требования:
- Наличие админского имени пользователя и пароля для доступа к Luxms BI

1. Перейдите в ветку проекта
   ```
   git checkout <project_name>
   ```

2. Установите зависимости
   ```
   yarn install
   ```
   или
   ```
   npm install
   ```

3. ~~Запустите команду~~
   ```
   npm run pull
   ```
   ~~которая скачает с сервера последнюю версию ресурсов (потребуются имя пользователя и пароль). Если ресурсы
   на сервере отличаются от локальных, будет выведен список изменений и ожидаться подтверждение перезаписи
   локальных файлов~~

4. Запустите проект

   ```
   yarn start
   ```
   или
   ```
   npm start
   ```

5. Зайдите браузером по адресу http://localhost:3000 (или другой порт, указанный в файле config.json) будет доступен
    сервер проекта, но файлы ресурсов будут браться из папки `/src` проекта

6. Работайте над файлами в папке `/src` и проверяйте их работу в браузере.

7. По окончании закоммитьте код в git-репозиторий и выполните команду
   ```
   yarn push
   ```
   или
   ```
   npm run push
   ```
   Для отправки изменений в ресурсы сервера. Потребуются имя пользователя и пароль. Команда выведет список
   измененных файлов и запросит подтверждение их отправки на сервер.


## Команды
Реализованы три команды

```
yarn pull
```
```
npm run pull
```
~~Все ресурсы с сервера будут скачены в папку `/src' проекта. Лишние локальные файлы будут удалены.~~

~~Команда запросит имя пользователя и пароль (если не указаны к конфиге), сравнит ресурсы сервера с
локальными файлами, напечатает список измененных файлов и запросит подтверждение.~~

```
yarn push
```

```
npm run push
```
Заливает все локальные файлы на сервер. Отсутствующие локально файлы будут удалены на сервере.

Команда запросит имя пользователя и пароль (если не указаны в конфиге), сравнит локальные файлы с
серверными, напечатает список измененных файлов и запросит подтверждение.

```
yarn start
```
```
npm start
```
Запускает на `http://localhost:3000` (либо порт, указанный в конфигурации config.json) http сервер для разработки
с настроенным проксированием запросов на указанный в конфиге сервер. Проксируются все файлы, кроме `/srv/resources`
которые берутся из папки `/src`


## Конфигурация

Проект считывает конфигурацию последовательно из разных источников.

В конфигурацию входят:
- `server` - http адрес сервера, например `http://project.luxmsbi.com/`
- `username` - имя пользователя для доступа к серверу. Требуются админские права
- `password` - пароль для пользователя `username`
- `port` - порт для запуска локального сервера для `npm start`
- `force` - выдавать ли предупреждение перед обновлением источника
- `noRemove` - запрещает удалять файлы, если при синхронизации они не найдены
- `include` - регулярное выражение для схем, которые следует включить (`^ds_\w+$` по умолчанию)
- `exclude` - регулярное выражение для схем, которые следует исключить
- `kerberos` - http адрес сервера для аутентификации kerberos, например `HTTP@sso.luxms.com`

Если значения `server`, `username` или `password` нигде не найдены,
то их потребуется ввести с клавиатуры.



### Источники конфигурации

Последовательно проверяются следующие источники конфигурации:

- Опции командной строки

    При запуске команды можно указать любые из опций:
    * `--server=...`
    * `--username=...`
    * `--password=...`
    * `--port=...`
    * `--force`
    * `--no-remove`
    * `--include=...`
    * `--exclude=...`
    * `--kerberos=...`

    Их необходимо отделять от команды знаком `--`

    ```
    yarn push --server=http://project.luxmsbi.com/ --username=admin --password=secret --exclude=ds_res
    npm start -- --server=http://project.luxmsbi.com/
    ```

- переменные окружения

    Те же имена, но должны быть написаны заглавными буквами с префиксом `BI_`:
    * `BI_SERVER`
    * `BI_USERNAME`
    * `BI_PASSWORD`
    * `BI_PORT`
    * `BI_FORCE`
    * `BI_NO_REMOVE`
    * `BI_INCLUDE`
    * `BI_EXCLUDE`

    Например:
    ```
    BI_SERVER=http://project.luxmsbi.com/  npm start
    BI_FORCE=yes BI_EXCLUDE=ds_res  npm start
    ```

    ```
    export BI_USERNAME=admin
    export BI_PASSWORD=secret
    npm run push
    ```

- Файлы конфигурации

    В корне проекта лежит файл `config.json`, который хранит значение конфигурации server
    ```
    {
        "server": "http://project.luxmsbi.com/"
    }
    ```
    Этот файл должен лежать в каждой ветке проекта и указывать корректный сервер

    Можно создать в корне проекта файл `authConfig.json` и в нем указать имя пользователя и пароль
    ```
    {
        "username": "admin",
        "password": "secret"
    }
    ```
    Этот файл занесен в `.gitignore` и не должен попасть в git.

    Для работы с разными проектами можно в файл authConfig занести разные записи, для каждой ветки. Ключем является название
    ветки git, значениями - `username` и `password`
    ```json
    {
        "project1": {
            "username": "project1admin",
            "password": "secret"
        },
        "project2": {
            "username": "project2admin",
            "password": "secret2"
        }
    }
    ```
    Приложение будет брать соответствующий конфиг по названию текущей ветки git.

- Ввод с клавиатуры
    Если значение не найдено ни одим из предыдущих способов, команды `npm start`, `npm run pull` и
    `npm run push` запросят их ввод с клавиатуры

### Примеры

#### server

Дает возможность указать удаленный сервер, с которым синхронизировать ресурсы

Способы указать сервер

- Аргументами командной строки:
```
$ yarn push --server=http://project.luxmsbi.com:8000/
$ npm run push -- --server=http://project.luxmsbi.com:8000/
```
- Через переменную окружения
```
$ export BI_SERVER=http://project.luxmsbi.com:8000/
$ yarn push
```
```
$ BI_SERVER=http://project.luxmsbi.com:8000/ yarn push
```
- Через конфиг файл
```
$ cat config.json
{
  "server": "http://project.luxmsbi.com:8000/"
}
$ yarn push
```


#### port
Дает возможность запустить сервер разработки на указанном порту

Например, требуется запустить проект на порту 8080, вместо порта из config.json (3000 если не указан)

```
$ yarn start --port=8080
```
```
$ BI_PORT=8080 yarn start
```
```
$ cat config.json
{
  "server": "http://project.luxmsbi.com",
  "port": 8080
}
$ yarn start
```
