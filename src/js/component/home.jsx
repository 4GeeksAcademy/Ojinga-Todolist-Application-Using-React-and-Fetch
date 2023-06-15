import React, { useState, useEffect } from "react";

/**
 * Function to retrieve or set username from/in local storage.
 *
 * @param {boolean} forceChange - If true, the function will always prompt for a new username.
 * @returns {string} The username.
 */
const getUserName = (forceChange) => {
    // Try to retrieve the username from local storage.
    let user = localStorage.getItem('username');

    // Prompt for a new username if one doesn't exist or forceChange is true.
    if(!user || forceChange) {
        do {
            user = prompt("Please enter your ToDo list API id", "");
        } while(user.length === 0); // This loop ensures that the user cannot submit an empty username.

        // Save the new username to local storage.
        localStorage.setItem('username', user);
    }

    return user;
};

/**
 * A component that handles a user's To-Do list.
 */
const Home = () => {
    const [inputValue, setInputValue] = useState(""); // State to hold the current input box value.
    const [list, setList] = useState([]); // State to hold the to-do list items.
    const [username, setUsername] = useState(getUserName(false)); // State to hold the username.

    /**
     * Function to create a new To-Do list for a user on the server.
     */
    const postData = () => {
        const newList = [{ label: "Empty", done: false }];

        fetch('https://assets.breatheco.de/apis/fake/todos/user/'+username, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newList) // Send the new list as the request body.
        })
        .then(resp => resp.json()) // Convert the server response to JSON.
        .then(() => {
            setList(newList); // Update the list state with the new list.
        })
        .catch(error => console.log(error)); // Log any errors.
    };

    /**
     * Function to delete all of a user's To-Do items on the server.
     */
    const deleteData = () => {
        fetch('https://assets.breatheco.de/apis/fake/todos/user/'+username, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.result === 'ok') {
                postData(); // Re-initialize the list on successful deletion.
            }
        })
        .catch(error => console.log(error));
    };

    // Fetch the user's to-do list when the component first loads or the username changes.
    useEffect(() => {
        fetch('https://assets.breatheco.de/apis/fake/todos/user/'+username, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(resp => resp.json())
        .then(data => {
            if (!data.length) {
                postData(); // Create a new list if no data is returned.
            } else {
                setList(data); // Set the fetched data as the current list.
            }
        })
        .catch(error => console.log(error));
    }, [username]);

    // Update the list on the server when it changes.
    useEffect(() => {
        if (list.length > 1) {
            fetch('https://assets.breatheco.de/apis/fake/todos/user/'+username, {
                method: "PUT",
                body: JSON.stringify(list),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(resp => resp.json())
            .then(data => console.log(data))
            .catch(error => console.log(error));
        }
    }, [list]);

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            setList([...list, { label: inputValue, done: false }]);
            setInputValue(""); // Clear the input box.
        }
    };

    const handleDelete = (index) => {
        let newList = [...list];
        newList.splice(index, 1); // Remove the specified item from the list.
        setList(newList); // Update the list state with the new list.
    };

    return (
        <div className="text-center">
            <h1>Todo list for: {username}</h1>
            <hr />
            <div>
                <input
                    type="text"
                    placeholder="Add tasks here"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={deleteData}>Clear All</button>
                <button onClick={() => setUsername(getUserName(true))}>Change Username</button>
            </div>
            {
                list.length <= 1 ? 
                (<p>No tasks, add a task</p>) :
                (
                    <div>
                        {
                            list.map((item, index) => {
                                if (index >= 1) {
                                    return (
                                        <div key={index} style={{ padding: '5px' }}>
                                            <span>{item.label}</span>
                                            <button onClick={() => handleDelete(index)}>Delete</button>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                )
            }
        </div>
    );
}

export default Home;
