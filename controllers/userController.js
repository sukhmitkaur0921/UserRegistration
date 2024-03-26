import { throws } from "assert"

import userModel from "../model/userModel.js"

import bcrypt from 'bcrypt'

class Controller {

    static signup_get = (req, res) => {


        console.log(req.session)

        //   req.session.isValid = true

        //   req.session.user_name = "Rock"

        console.log(req.session)

        console.log(req.session.id)
        const myMsg = req.session.msg
        res.render('signup.ejs', { myMsg })
    }


    static signup_post = async (req, res) => {

        var existing_usr = "";


        try {

            const form_data = req.body

            console.log(form_data)

            //   res.send(form_data)

            existing_usr = await userModel.findOne({ email: form_data.usr_email })

            if (existing_usr) {
                req.session.msg = `Dear ${existing_usr.name} you are already registered  please login `
                return res.redirect('/login')
            }

            const hashed_pwd = await bcrypt.hash(form_data.usr_pwd, 10)

            const user_to_save = new userModel({

                name: form_data.usr_name,
                email: form_data.usr_email,
                pwd: hashed_pwd

            })

            const usr_saved = await user_to_save.save()

            //  res.send(usr_saved)
            req.session.msg = `Signup Successfull Dear ${usr_saved.name}`
            return res.redirect('/login')




        }
        catch (err) {
            console.log(err)
            res.send(err)
        }

    }

    static login_get = (req, res) => {
        const myMsg = req.session.msg
        delete req.session.msg




        res.render('login.ejs', { myMsg })
    }

    static login_post = async (req, res) => {

        try {

            const form_data = req.body

            // first confirm that this is an existing user

            console.log(form_data)

            const existing_usr = await userModel.findOne({ email: form_data.usr_email })

            console.log(existing_usr)
            if (!existing_usr) {
                console.log(existing_usr)
                console.log("Not an Existing User")
                req.session.msg = `Please Signin to sigh in page`
                res.redirect('/signup')

            }

            else {

                const pwd_match = await bcrypt.compare(form_data.usr_pwd, existing_usr.pwd)

                console.log(pwd_match)

                if (pwd_match) {

                    // For Succesfully Logged in User We are 
                    // Making isValid =true to give access to dashboard page
                    // We have to comment out isValid = true in signup_get
                    // to avoid isValid = true before Login process

                    req.session.isValid = true

                    //pass masage in dashboard 
                    //using session this massage is recived in dashboard_get request

                    req.session.msg = `welcome dear ${existing_usr.name} to dashboard page`
                    console.log(req.session.msg)
                    res.redirect('/dashboard')
                }
                else {
                    req.session.msg = `password is not accurate`
                    res.redirect('/login')
                }

            }


        } catch (err) {

            console.log(err)
            res.send(err)
        }


    }

    static dashboard_get = (req, res) => {
        // massage variable  from session
        const myMsg = req.session.msg

        res.render('dashboard.ejs', { myMsg })

    }
    static home_get = (req, res) => {

        res.render('home.ejs')
    }

    static logout_post = (req, res) => {

        req.session.destroy((err) => {
            if (err) throw er

            res.redirect('/home')
        })
    }

}

export default Controller