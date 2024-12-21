/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { deleteTodo, getTodos, updateTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { getCompletedTodos, pause } from './utils/methods';
import { TodoList } from './components/TodoList';
import { FILTER_BY } from './constants/constants';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Error } from './components/Error';

function filterTodos(todos: Todo[], filterBy: string) {
  const copy = [...todos];

  switch (filterBy) {
    case FILTER_BY.ALL:
      return copy;
    case FILTER_BY.ACTIVE:
      return copy.filter(e => !e.completed);
    case FILTER_BY.COMPLETED:
      return copy.filter(e => e.completed);
  }

  return [];
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterBy, setFilterBy] = useState(FILTER_BY.ALL);
  const [loader, setLoader] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [massLoader, setMassLoader] = useState(false);
  const filteredTodos = filterTodos(todos, filterBy);

  useEffect(() => {
    setTimeout(() => {
      getTodos()
        .then(todosFromServer => {
          setTodos(todosFromServer);
        })
        .catch(() => setErrorMessage('Unable to load todos'));
    }, 200);
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const sizeItemsLeft = () => todos.length - getCompletedTodos(todos).length;

  const handleUpdateCompleted = async (todo: Todo) => {
    const updatedTodo = {
      id: todo.id,
      completed: todo.completed,
    };

    try {
      setLoader(true);
      await pause();
      const newTodo = await updateTodo(updatedTodo);

      setTodos(prev => {
        return prev.map(e => (e.id === newTodo.id ? { ...e, ...newTodo } : e));
      });
    } catch {
      setErrorMessage('Unable to update todo');
    } finally {
      setLoader(false);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    setLoader(true);

    await pause();
    await deleteTodo(id)
      .catch(() => {
        setErrorMessage('Unable to delete todo');
      })
      .finally(() => setLoader(false));

    setTodos(prev => {
      const copy = [...prev];
      const index = copy.findIndex(e => e.id === id);

      copy.splice(index, 1);

      return copy;
    });
  };

  const clearCompleted = async () => {
    setMassLoader(true);
    const completedTodos = getCompletedTodos(todos);

    try {
      await pause();
      await Promise.all(completedTodos.map(e => deleteTodo(e.id)));
      setTodos(prev => {
        return prev.filter(e => !e.completed);
      });
    } catch {
      setErrorMessage('Unable to delete todos');
    } finally {
      setMassLoader(false);
    }
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          sizeLeft={sizeItemsLeft()}
          onTodos={setTodos}
          onErrorMessage={setErrorMessage}
          onLoader={setLoader}
          onMassLoader={setMassLoader}
          onTempTodo={setTempTodo}
        />
        {/*List of Todos */}
        {filteredTodos.length > 0 && (
          <TodoList
            todos={filteredTodos}
            onUpdate={handleUpdateCompleted}
            onDelete={handleDeleteTodo}
            loader={loader}
            massLoader={massLoader}
            tempTodo={tempTodo}
          />
        )}

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <Footer
            filter={filterBy}
            sizeLeft={sizeItemsLeft()}
            onFilter={setFilterBy}
            onClear={clearCompleted}
            todos={todos}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <Error errorMessage={errorMessage} onErrorMessage={setErrorMessage} />
    </div>
  );
};
