import { Model, IMongoloquentSchema, IMongoloquentTimestamps } from "mongoloquent";

interface IAdmins extends IMongoloquentSchema, IMongoloquentTimestamps {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
}

class Admin extends Model<IAdmins> {
    /**
     * The attributes of the model.
     *
     * @var IAdmins
     */
    public static $schema: IAdmins

    // ...
    protected $collection: string = "admins";
}


async function createAdmin() {
    const admin = new Admin();

    admin.name = "nathan";
    admin.email = "nathan@email.com"
    admin.password = "12345"
    admin.phoneNumber = "111111111"

    await admin.save();
}

