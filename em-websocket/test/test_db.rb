require 'test/unit'

require_relative '../utils/db'
require_relative '../model/user'

class TestDB < Test::Unit::TestCase

  def test_get_user_returns_a_User_object
    user = DB.get_user :id => 1
    assert_true user.instance_of? User
  end

  def test_get_user_return_user_with_correct_id
    user_id = 1
    user = DB.get_user :id => user_id

    assert_equal user.id, user_id
  end

  def test_get_user_return_nil_if_not_found_in_db
    user = DB.get_user :id => -1

    assert_nil user
  end

  def test_get_user_with_login_information
    username = "usr0"
    password = "psw0"

    user = DB.get_user :username => username, :password => password

    assert_equal user.username, username
    assert_equal user.password, password
  end
end
