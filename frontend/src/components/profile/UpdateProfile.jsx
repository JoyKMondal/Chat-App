/* eslint-disable no-empty */
import { Fragment, useContext, useEffect, useState } from "react";
import Button from "../../shared/components/FormElements/Button";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import Input from "../../shared/components/FormElements/Input";
import { useForm } from "../../shared/hooks/form-hook";
import { VALIDATOR_REQUIRE } from "../../shared/util/validators";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";

const UpdateProfile = () => {
  const [updateUser, setUpdateUser] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);

  const [formState, inputHandler, setFormData] = useForm(
    {
      name: {
        value: "",
        isValid: false,
      },
      image: {
        value: null,
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/users/${
            auth.userId
          }`
        );

        setUpdateUser(responseData.user);
        setFormData(
          {
            name: {
              value: responseData.user.fullName,
              isValid: true,
            },
            email: {
              value: responseData.user.profileImage,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
    };
    fetchUsers();
  }, [sendRequest, auth.userId, setFormData]);

  const updateProfileHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", formState.inputs.name.value);
      formData.append("image", formState.inputs.image.value);
      await sendRequest(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/users/${
          auth.userId
        }`,
        "PATCH",
        formData,
        // JSON.stringify({
        //   name: formState.inputs.name.value,
        //   email: formState.inputs.email.value,
        // }),
        {
          //   "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
    } catch (err) {}
  };

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && updateUser && (
        <div className="modal-box">
          <h3 className="font-bold text-lg text-center">Update Profile</h3>
          <div className="divider"></div>
          <form method="dialog">
            <button className="btn btn-lg btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <div className="flex gap-5 justify-center items-center">
            <ImageUpload
              id="image"
              onInput={inputHandler}
              errorText="Please provide an image"
            />
            <div className="avatar">
              <div className="w-32 rounded-lg">
                <img
                  alt="Tailwind CSS chat bubble component"
                  src={`${updateUser.profileImage}`}
                />
              </div>
            </div>
          </div>
          <p className="py-2 pb-0">
            <Input
              id="name"
              element="input"
              type="text"
              label="Change Name"
              placeholder="Type here"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter your name."
              className="input input-bordered w-full"
              onInput={inputHandler}
              initialValue={updateUser.fullName}
              initialValid={true}
            />
          </p>
          <div className="modal-action">
            <form method="dialog" onSubmit={updateProfileHandler}>
              <Button
                type="submit"
                disabled={!formState.isValid}
                className="btn"
              >
                Update
              </Button>
            </form>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default UpdateProfile;
